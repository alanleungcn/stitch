<script lang="ts">
  import Modal from '../components/Modal.svelte';
  import Header from '../components/Header.svelte';
</script>

<div class="grid h-full w-full grid-rows-3">
  <Header />
  <div class="row-start-2 flex items-center justify-center">
    <div class="flex flex-col items-center gap-4">
      <h1 class="text-6xl font-black">STITCH</h1>
      <div class="flex w-full flex-col gap-4 sm:flex-row">
        <label
          for="host-modal"
          class="modal-button btn btn-outline btn-primary grow text-base"
          >Host</label
        >
        <input type="checkbox" id="host-modal" class="modal-toggle" />
        <Modal role="host" />
        <label
          for="view-modal"
          class="modal-button btn btn-outline btn-primary grow text-base"
          >View</label
        >
        <input type="checkbox" id="view-modal" class="modal-toggle" />
        <Modal role="view" />
      </div>
    </div>
  </div>
</div>
