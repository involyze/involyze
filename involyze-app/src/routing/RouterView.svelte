<script lang="ts">
  import { useCurrentRouteSvelte } from './useCurrentRoute.svelte';
  import Login from '../auth/Login.svelte';
  import { useAuthentication } from '../auth/useAuthentication';
  import LoginButton from '../auth/LoginButton.svelte';
  import Landingpage from './Landingpage.svelte';
  import NotFound from './NotFound.svelte';
  import AuthenticatedPage from './AuthenticatedPage.svelte';

  const route = useCurrentRouteSvelte();
  const authentication = useAuthentication();
</script>

{#if authentication.isAuthenticated()}
  {#if route.path === '/'}
    <AuthenticatedPage page="scan"></AuthenticatedPage>
  {:else if route.path === '/login'}
    <Login />
  {:else if route.path === '/list'}
    <AuthenticatedPage page="list"></AuthenticatedPage>
  {:else if route.path === '/statistics'}
    <AuthenticatedPage page="statistics"></AuthenticatedPage>
  {:else}
    <NotFound />
  {/if}
{:else if route.path === '/'}
  <Landingpage />
{:else if route.path === '/login'}
  <Login />
{:else}
  <LoginButton />
{/if}
