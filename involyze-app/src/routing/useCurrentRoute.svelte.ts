const currentPath = window.location?.pathname ?? '';
const searchParams = new URL(window.location.toString() ?? '').searchParams;

const currentRoute = $state({
  path: currentPath,
  queryParams: searchParams,
});

const readonlyRoute = $derived(currentRoute);

const navigate = (path: string, query?: URLSearchParams) => {
  const url = new URL(path);
  if (query) {
    for (const entry of query.entries()) {
      url.searchParams.append(entry[0], entry[1]);
    }
  }
  window.location.assign(url);

  currentRoute.path = url.pathname;
  currentRoute.queryParams = url.searchParams;
};

export const useCurrentRouteSvelte = () => {
  return readonlyRoute;
};

export const useRouter = () => {
  return {
    navigate,
    currentRoute: readonlyRoute,
  };
};
