<script lang="ts">
  import '../app.css';
  import { browser } from '$app/env';
  import { theme } from '../store/theme';
  import { SvelteToast } from '@zerodevx/svelte-toast';

  theme.subscribe((value) => {
    if (browser) localStorage.setItem('theme', value);
  });

  const options = {};
</script>

<SvelteToast {options} />
<slot />
