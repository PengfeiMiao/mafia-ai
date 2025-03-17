import {useState} from "react";
import _ from "lodash";

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

export const isEmptyOrNull = (arr) => _.isEmpty(arr) || arr == null;

export const orElse = (value, defaultVal) => isEmptyOrNull(value) ? defaultVal : value;
