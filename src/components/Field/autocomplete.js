/* eslint consistent-return: off */

const filterWords = (value, options) => {
  const inputLetters = value.toLowerCase();

  // filter the list of hints according to the pressed key
  const filterOptions = () => {
    let low = 0;
    let high = options.length - 1;

    while (low <= high) {
      const midWordIndex = Math.floor((low + high) / 2);
      const midWordSubstring = options[midWordIndex].slice(0, inputLetters.length).toLowerCase();
      if (midWordSubstring === inputLetters) {
        return midWordIndex;
      }
      if (midWordSubstring < inputLetters) {
        low = midWordIndex + 1;
      } else {
        high = midWordIndex - 1;
      }
    }
  };

  const midWord = filterOptions();

  const filterLeftRightOptions = (l, h, feature) => {
    let low = l;
    let high = h;
    while (low <= high) {
      const midWordIndex = Math.floor((low + high) / 2);
      const midWordSubstring = options[midWordIndex].slice(0, inputLetters.length).toLowerCase();
      if (midWordIndex === 0 || midWordIndex >= options.length) {
        return midWordIndex;
      }
      const previousSubstring = options[midWordIndex - 1]
        .slice(0, inputLetters.length)
        .toLowerCase();
      const nextSubstring = options[midWordIndex + 1].slice(0, inputLetters.length).toLowerCase();
      if (
        (previousSubstring !== inputLetters || nextSubstring !== inputLetters) &&
        midWordSubstring === inputLetters
      ) {
        return midWordIndex;
      }
      if (
        (feature === 'left' && midWordSubstring === inputLetters) ||
        (feature === 'right' && midWordSubstring > inputLetters)
      ) {
        high = midWordIndex;
      } else {
        low = midWordIndex;
      }
    }
  };

  const filterLeftOptions = () => {
    const low = 0;
    const high = midWord;

    if (midWord === 0 || !midWord) {
      return midWord;
    }

    const previousSubstring = options[midWord - 1].slice(0, inputLetters.length).toLowerCase();

    if (previousSubstring !== inputLetters) return midWord;
    return filterLeftRightOptions(low, high, 'left');
  };

  const filterRightOptions = () => {
    const low = midWord;
    const high = options.length - 1;

    if (midWord >= options.length - 1 || !midWord) {
      return midWord;
    }

    const nextSubstring = options[midWord + 1].slice(0, inputLetters.length).toLowerCase();
    if (nextSubstring !== inputLetters) return midWord;

    return filterLeftRightOptions(low, high, 'right');
  };

  const filteredHintsList = options.slice(filterLeftOptions(), filterRightOptions() + 1);
  return filteredHintsList;
};

export default filterWords;
