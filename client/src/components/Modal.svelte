<script lang="ts">
  import axios from 'axios';
  import { origin } from '../store/origin';
  import { toast } from '@zerodevx/svelte-toast';
  import { goto } from '$app/navigation';

  export let role: 'host' | 'view';
  let roomId: string = '',
    roomExist: boolean = role === 'host' ? false : true,
    roomIdValid: boolean = true,
    loading: boolean = false;

  async function onSubmit() {
    roomIdValid = true;
    roomExist = role === 'host' ? false : true;
    roomId = roomId.trim();

    if (roomId.length === 0 || roomId.length > 16) {
      roomId = '';
      roomIdValid = false;
      return;
    }

    loading = true;

    try {
      const {
        data: { exist },
      }: { data: { exist: boolean } } = await axios.post(
        `${$origin}/roomexist`,
        { roomId }
      );
      roomExist = exist;
      if (
        (role === 'host' && roomExist === true) ||
        (role === 'view' && roomExist === false)
      )
        return (roomId = '');
      goto(`/app?role=${role}&roomid=${roomId}`);
    } catch (err) {
      console.error(err);
      toast.push('Failed to connect to server');
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <form on:submit|preventDefault={onSubmit}>
      <label class="label" for="room-name">
        <span class="text-3xl font-bold"
          >{role === 'host' ? 'Create room' : 'Join room'}</span
        >
      </label>
      <input
        type="text"
        data-lpignore="true"
        autocomplete="off"
        bind:value={roomId}
        placeholder="Room name"
        class:input-error={!roomIdValid}
        class="input input-bordered w-full text-lg"
      />
      <label class="label flex flex-col items-start gap-1" for="room-name">
        {#if roomExist && role === 'host'}
          <span class="label-text text-error"
            >Room name taken, try another name</span
          >
        {:else if !roomExist && role === 'view'}
          <span class="label-text text-error">Room does not exist</span>
        {/if}
        {#if !roomIdValid}
          <span class="label-text text-error"
            >Room name cannot be blank or exceeds 16 characters</span
          >
        {/if}
        <span class="label-text"
          >{role === 'host'
            ? 'Share the name for others to view'
            : 'Enter room name shared by the host'}</span
        >
      </label>
      <div class="modal-action">
        <div
          class="btn-group btn-group-vertical w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end"
        >
          <label
            for={`${role}-modal`}
            class="btn btn-block btn-secondary sm:w-24">Cancel</label
          >
          <button
            type="submit"
            class="btn btn-primary btn-block sm:w-24"
            class:loading
          >
            {#if !loading}
              {role === 'host' ? 'Create' : 'Join'}
            {/if}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>
