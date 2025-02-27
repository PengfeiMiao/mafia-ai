import {useState} from "react";

export const useDelayToggle = () => {
  const [toggle, setToggle] = useState(true);

  const onToggle = (delay = 1200) => {
    setToggle(false);
    setTimeout(() => {
      setToggle(true);
    }, delay);
  };

  return {toggle, onToggle};
};