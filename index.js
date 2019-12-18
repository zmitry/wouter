import locationHook from "./use-location.js";
import makeMatcher from "./matcher.js";

import {
  useRef,
  useLayoutEffect,
  useContext,
  useCallback,
  createContext,
  isValidElement,
  cloneElement,
  createElement as h
} from "./react-deps.js";

/*
 * Part 1, Hooks API: useRouter, useRoute and useLocation
 */

// one of the coolest features of `createContext`:
// when no value is provided — default object is used.
// allows us to use the router context as a global ref to store
// the implicitly created router (see `useRouter` below)
const RouterCtx = createContext({});

const buildRouter = ({
  hook = locationHook,
  base = "",
  matcher = makeMatcher()
} = {}) => ({ hook, base, matcher });

function useConst(fn) {
  const ref = useRef(null);
  return ref.current || (ref.current = fn());
}
export const useRouter = () => {
  const globalRef = useContext(RouterCtx);
  return globalRef.v
};

export const useLocation = () => {
  const router = useRouter();
  return router.hook(router);
};

export const useRoute = pattern => {
  const [path] = useLocation();
  return useRouter().matcher(pattern, path);
};

/*
 * Part 2, Low Carb Router API: Router, Route, Link, Switch
 */

export const Router = props => {
  return h(RouterCtx.Provider, {
    value: useConst(()=>({ v: buildRouter(props) })),
    children: props.children
  });
};

export const Route = ({ path, match, children }) => {
  const [matches, params] = match ?? useRoute(path);
  if (!matches) return null;
  return typeof children === "function" ? children(params) : children;
};

export const Switch = ({ children, location }) => {
  const { matcher } = useRouter();
  const [originalLocation] = useLocation();

  children = Array.isArray(children) ? children : [children];
  let match;
  const match = React.Children.toArray(children).find(el=> isValidElement(el) &&
      // we don't require an element to be of type Route,
      // but we do require it to contain a truthy `path` prop.
      // this allows to use different components that wrap Route
      // inside of a switch, for example <AnimatedRoute />.
      (match = element.props.path
        ? matcher(element.props.path, location || originalLocation)
        : [true, {}]
      )[0]))
  return cloneElement(element, { match });
};

export const Redirect = props => {
  const [, push] = useLocation();
  useLayoutEffect(() => {
    push(props.href || props.to);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export default useRoute;
