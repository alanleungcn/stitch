<script lang="ts">
  import axios from 'axios';
  import { page } from '$app/stores';
  import { browser } from '$app/env';
  import { onDestroy } from 'svelte';
  import { origin } from '../store/origin';
  import { toast } from '@zerodevx/svelte-toast';
  import { afterNavigate, goto } from '$app/navigation';
  import { WebRTC } from '../class/WebRTC';
  import Spinner from '../components/Spinner.svelte';
  import {
    WebSocketServer,
    type Room,
    type SignalingPayload,
  } from '../class/WebSocketServer';
  import CameraMenu from '../components/CameraMenu.svelte';
  import DisplayMenu from '../components/DisplayMenu.svelte';

  let ws: WebSocketServer | null,
    wrtc: WebRTC | null,
    role: string,
    viewNo: number,
    roomId: string,
    streaming: boolean = false,
    stream: MediaStream | null,
    noUserMedia: boolean = false,
    noDisplayMedia: boolean = false,
    fromURL: URL | null,
    textareaRef: HTMLTextAreaElement,
    videoRef: HTMLVideoElement,
    videoPaused: boolean = true;

  $: fromURL, init();

  function playStream() {
    videoRef.srcObject = stream;
    videoRef.play();
    videoPaused = false;
    /* videoRef.play();
    videoPaused = false; */
  }

  function closeStream() {
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
    }
  }

  async function initStream(
    type: 'user' | 'display',
    constraints: MediaStreamConstraints
  ) {
    const replace = streaming;
    try {
      let newStream: MediaStream | null = null;
      streaming = true;

      if (type === 'user')
        newStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (type === 'display')
        newStream = await navigator.mediaDevices.getDisplayMedia(constraints);

      if (!newStream) return;

      closeStream();

      newStream.getTracks().forEach((track) => {
        track.onended = () => {
          streaming = false;
        };
      });

      if (replace) wrtc?.replaceTrack(newStream);
      else wrtc?.addTrack(newStream);

      videoRef.srcObject = newStream;
      videoRef.play();
      stream = newStream;
    } catch (err) {
      console.error(err);
      toast.push('Permission denied');
    }
  }

  function onRoomUpdate(oldRoom: Room, newRoom: Room, type: 'join' | 'leave') {
    viewNo = newRoom.viewId.length;
    if (role === 'view') return;
    if (type === 'join') {
      const to = newRoom.viewId.at(-1);
      to && wrtc?.addPeer(to, stream);
    } else {
      const newViewId = new Set(newRoom.viewId);
      const socketId = oldRoom.viewId.filter((e) => !newViewId.has(e));
      wrtc?.removePeer(socketId[0]);
    }
  }

  function onTrack(
    track: MediaStreamTrack,
    streams: ReadonlyArray<MediaStream>
  ) {
    streaming = true;
    track.onunmute = () => {
      stream = streams[0];

      /* if (videoRef.srcObject) return;
      videoRef.srcObject = streams[0];
      videoRef.play(); */
    };
  }

  function onRoomDelete() {
    toast.push(role === 'host' ? 'Connectin lost' : 'Host has left the room');
    goto('/');
  }

  function onSignalIn(from: string, payload: SignalingPayload) {
    wrtc?.onSignalIn(from, payload);
  }

  async function init() {
    if (!browser || fromURL === undefined) return;

    /* noUserMedia =
      !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia;
    noDisplayMedia =
      !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia; */

    let tmpRole = $page.url.searchParams.get('role');
    let tmpRoomId = $page.url.searchParams.get('roomid');

    if (!tmpRoomId || !tmpRole || !['host', 'view'].includes(tmpRole))
      return goto('/');

    role = tmpRole;
    roomId = tmpRoomId;

    if (fromURL?.pathname !== '/') {
      try {
        const {
          data: { exist },
        }: { data: { exist: boolean } } = await axios.post(
          `${$origin}/roomexist`,
          {
            roomId,
          }
        );

        if ((exist && role === 'host') || (!exist && role === 'view'))
          return goto('/');
      } catch (err) {
        console.error(err);
        goto('/');
      }
    }

    ws = new WebSocketServer($origin, onRoomUpdate, onRoomDelete, onSignalIn);
    wrtc = new WebRTC((to, payload) => ws?.signal(to, payload), onTrack);

    if (role === 'host') ws.createRoom(roomId);
    if (role === 'view') ws.joinRoom(roomId);
  }

  function disconnect() {
    closeStream();
    goto('/');
  }

  function copyRoomId() {
    if (navigator.clipboard) navigator.clipboard.writeText(roomId);
    else {
      textareaRef.select();
      document.execCommand('copy');
    }
    toast.push('Copied room name');
  }

  afterNavigate(({ from }) => {
    fromURL = from;
  });

  onDestroy(() => {
    ws?.disconnect();
  });
</script>

<div class="flex h-full w-full flex-col justify-between px-4">
  <!-- Info -->
  <div class="my-4 flex flex-row items-center justify-between">
    <!-- Role -->
    <div class="stats shadow-md">
      <div class="stat p-4">
        <div class="stat-title">Role</div>
        <span class="stat-value text-2xl sm:text-3xl"
          >{role ? (role === 'host' ? 'Host' : 'Viewer') : ''}</span
        >
      </div>
    </div>
    <!-- Viewers -->
    <div class="flex flex-row gap-4">
      <div class="stats shadow-md">
        <div class="stat p-4">
          <div class="stat-title">Viewers</div>
          <span class="stat-value text-2xl sm:text-3xl"
            >{viewNo >= 0 ? viewNo : ''}</span
          >
        </div>
      </div>
      <!-- Room name -->
      <div
        class="stats w-32 cursor-pointer shadow-md sm:w-auto "
        on:click={copyRoomId}
      >
        <div class="stat p-4">
          <div class="stat-title">Room name</div>
          <span class="stat-value text-2xl sm:text-3xl"
            >{roomId ? roomId : ''}</span
          >
          <textarea bind:this={textareaRef} class="hidden">{roomId}</textarea>
        </div>
      </div>
    </div>
  </div>
  <!-- Video -->
  <div class="bg-base-100 relative flex grow items-center justify-center">
    {#if role === 'view' && !streaming}
      <Spinner />
    {:else if role === 'host' && !streaming && (noUserMedia || noDisplayMedia)}
      <span class="text-center"
        >{noUserMedia && noDisplayMedia
          ? 'Streaming'
          : noUserMedia
          ? 'Camera streaming'
          : noDisplayMedia && 'Display streaming'} is not supported on this device</span
      >
    {:else if role === 'host' && !streaming}
      <span class="text-center">Select options below to start streaming</span>
    {/if}
    {#if streaming}
      <video
        bind:this={videoRef}
        class="absolute top-1/2 left-1/2 h-full -translate-x-1/2 -translate-y-1/2 transform object-contain"
        autoplay
        controls
      >
        <track kind="captions" />
      </video>
      {#if videoPaused && role === 'view'}
        <button class="btn aboslute btn-primary z-10" on:click={playStream}
          >Play stream</button
        >
      {/if}
    {/if}
  </div>
  <!-- Control -->
  <div class="my-8 flex flex-row items-center justify-center gap-4">
    {#if role === 'host' && streaming}
      <div class="tooltip" data-tip="Stop stream">
        <button
          class="btn btn-circle btn-lg btn-error mt-2 shadow-md"
          on:click={() => {
            closeStream();
            streaming = false;
          }}
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-8 w-8"
            ><path
              d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"
            /><line x1="1" y1="1" x2="23" y2="23" /></svg
          ></button
        >
      </div>
    {/if}
    {#if role === 'host'}
      <CameraMenu
        disabled={noUserMedia}
        on:camera={(e) => initStream('user', e.detail)}
      />
      <DisplayMenu
        disabled={noDisplayMedia}
        on:display={(e) => initStream('display', e.detail)}
      />
    {/if}
    <div class="tooltip" data-tip="Leave room">
      <button
        class="btn btn-circle btn-lg btn-error mt-2 shadow-md"
        on:click={disconnect}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-8 w-8"
          ><path
            d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"
          /><line x1="23" y1="1" x2="1" y2="23" /></svg
        >
      </button>
    </div>
  </div>
</div>
