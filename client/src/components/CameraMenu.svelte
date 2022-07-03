<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import {
    type CameraOpt,
    getCameraOpt,
    setCameraOpt,
  } from '../utils/streamOpt';

  export let disabled: boolean;
  let cameraOpt: CameraOpt = { audio: true, video: 'rear' };

  const dispatch = createEventDispatcher<{
    camera: MediaStreamConstraints;
  }>();

  function closeMenu() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  function start() {
    closeMenu();
    setCameraOpt(cameraOpt);
    dispatch('camera', {
      audio: cameraOpt.audio,
      video: {
        facingMode:
          cameraOpt.video === 'front' ? 'user' : { exact: 'environment' },
      },
    });
  }

  onMount(() => {
    const tmp = getCameraOpt();
    if (tmp !== null) cameraOpt = tmp;
    else setCameraOpt(cameraOpt);
  });
</script>

<div class="dropdown dropdown-top">
  <div class="tooltip" data-tip="Stream camera">
    <label
      for=""
      tabindex="0"
      class:btn-disabled={disabled}
      class="btn btn-circle btn-lg btn-secondary mt-2 shadow-md"
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
          d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        /><circle cx="12" cy="13" r="4" /></svg
      ></label
    >
  </div>
  <ul
    tabindex="0"
    class="dropdown-content menu rounded-box bg-base-100 w-52 p-2 shadow-md"
  >
    <li class="menu-title">
      <span>Audio</span>
    </li>
    <li class="form-control">
      <label class="label cursor-pointer">
        <span class="label-text">Enabled</span>
        <input
          type="checkbox"
          bind:checked={cameraOpt.audio}
          class="checkbox checkbox-primary checked:border-primary checked:hover:border-primary border-current opacity-20 checked:opacity-100 hover:border-current"
        />
      </label>
    </li>
    <li class="menu-title">
      <span>Camera</span>
    </li>
    <li class="form-control">
      <label class="label cursor-pointer">
        <span class="label-text">Front</span>
        <input
          type="radio"
          class="radio checked:bg-primary"
          bind:group={cameraOpt.video}
          value="front"
        />
      </label>
    </li>
    <li class="form-control">
      <label class="label cursor-pointer">
        <span class="label-text">Rear</span>
        <input
          type="radio"
          class="radio checked:bg-primary"
          bind:group={cameraOpt.video}
          value="rear"
        />
      </label>
    </li>

    <button class="btn btn-primary mt-2" on:click={start}>Start</button>
  </ul>
</div>
