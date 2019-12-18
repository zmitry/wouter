export const Link = props => {
  const [, navigate] = useLocation();
  const { base } = useRouter();

  const href = props.href || props.to;
  const { children, onClick } = props;

  const handleClick = useCallback(
    event => {
      // ignores the navigation when clicked using right mouse button or
      // by holding a special modifier key: ctrl, command, win, alt, shift
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button !== 0
      )
        return;

      event.preventDefault();
      navigate(href);
      onClick && onClick(event);
    },
    [href, onClick, navigate]
  );

  // wraps children in `a` if needed
  const extraProps = { href: base + href, onClick: handleClick, to: null };
  const jsx = isValidElement(children) ? children : h("a", props);

  return cloneElement(jsx, extraProps);
};
