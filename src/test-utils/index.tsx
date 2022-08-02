import {
  render as rtlRender,
  RenderOptions,
  RenderResult,
} from "@testing-library/react";
import { createMemoryHistory, MemoryHistory } from "history";
import { ReactElement } from "react";
import { Provider } from "react-redux";
import { Router } from "react-router";

import { configureStoreWithMiddlewares, RootState } from "../app/store";

type CustomRenderOptions = {
  preloadedState?: RootState;
  routeHistory?: Array<string>;
  initialRouteIndex?: number;
  renderOptions?: Omit<RenderOptions, "wrapper">; // Omit:刪除一個物件屬性
};

type CustromRenderResult = RenderResult & { history: MemoryHistory };

function render(
  ui: ReactElement,
  {
    preloadedState = {},
    routeHistory,
    initialRouteIndex,
    ...renderOptions
  }: CustomRenderOptions = {}
): CustromRenderResult {
  const history = createMemoryHistory({
    initialEntries: routeHistory,
    initialIndex: initialRouteIndex,
  });
  const Wrapper: React.FC = ({ children }) => {
    const store = configureStoreWithMiddlewares(preloadedState);

    return (
      <Provider store={store}>
        <Router history={history}> {children}</Router>
      </Provider>
    );
  };
  const rtlRenderResult = rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
  return { ...rtlRenderResult, history };
}

export * from "@testing-library/react";
export { render };
