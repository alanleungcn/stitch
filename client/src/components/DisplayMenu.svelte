<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import {
    type DisplayOpt,
    getDisplayOpt,
    setDisplayOpt,
  } from '../utils/streamOpt';

  export let disabled: boolean;
  let displayOpt: DisplayOpt = {
    audio: true,
    framerate: '60',
    resolution: 'source',
  };

  const dispatch = createEventDispatcher<{ display: MediaStreamConstraints }>();

  function closeMenu() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  function start() {
    closeMenu();
    setDisplayOpt(displayOpt);
    dispatch('display', {
      audio: displayOpt.audio,
      video: {
        frameRate: parseInt(displayOpt.framerate),
        height:
          displayOpt.resolution === 'source'
            ? undefined
            : parseInt(displayOpt.resolution),
      },
    });
  }

  onMount(() => {
    const tmp = getDisplayOpt();
    if (tmp !== null) displayOpt = tmp;
    else setDisplayOpt(displayOpt);
  });
</script>

<div class="dropdown dropdown-top">
  <div class="tooltip" data-tip="Stream screen">
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
          d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"
        /><line x1="2" y1="20" x2="2.01" y2="20" /></svg
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
          bind:checked={displayOpt.audio}
          class="checkbox checkbox-primary checked:border-primary checked:hover:border-primary border-current opacity-20 checked:opacity-100 hover:border-current"
        />
      </label>
    </li>
    <li class="menu-title">
      <span>Framerate</span>
    </li>
    <div class="mx-1">
      <select
        class="select select-sm my-2 w-full"
        bind:value={displayOpt.framerate}
      >
        <option>60</option>
        <option>30</option>
        <option>15</option>
        <option>5</option>
      </select>
    </div>
    <li class="menu-title">
      <span>Resolution</span>
    </li>
    <div class="mx-1">
      <select
        class="select select-sm my-2 w-full capitalize"
        bind:value={displayOpt.resolution}
      >
        <option>source</option>
        <option>1080</option>
        <option>720</option>
        <option>480</option>
      </select>
    </div>
    <button class="btn btn-primary mt-2" on:click={start}>Start</button>
  </ul>
</div>
