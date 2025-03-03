import {Presence} from "@chakra-ui/react";

const SlideBox = ({open, align, outerStyle, children}) => {
  const rootStyle = {
    height: "100%",
    width: "100%",
    display: (open ? 'block' : 'none'),
    ...outerStyle
  };

  const handleAlign = (_align) => {
    switch (_align) {
      case "left":
        return {
          _open: "slide-from-left",
          _closed: "slide-to-left",
        };
      case "right":
        return {
          _open: "slide-from-right",
          _closed: "slide-to-right",
        };
      case "top":
        return {
          _open: "slide-from-top",
          _closed: "slide-to-top",
        };
      case "bottom":
        return {
          _open: "slide-from-bottom",
          _closed: "slide-to-bottom",
        };
      default:
        return {
          _open: "fade-in",
          _closed: "fade-out",
        };
    }
  };

  return (<Presence
    style={rootStyle}
    bgColor={'bg.panel'}
    borderTopRadius={outerStyle?.borderTopRadius}
    present={open}
    animationName={handleAlign(align)}
    animationDuration="slow"
  >
    {children}
  </Presence>);
};

export default SlideBox;