/* eslint consistent-return: off */
import options from '../../data/words.json';

const filterWords = (value) => {
  const sortedOptions = options.sort((a, b) => a.localeCompare(b));
  const inputLetters = value.toLowerCase();
  // filter the list of hints according to the pressed key
  const filterOptions = () => {
    let low = 0;
    let high = sortedOptions.length - 1;

    while (low <= high) {
      const midWordIndex = Math.floor((low + high) / 2);
      const midWordSubstring = sortedOptions[midWordIndex]
        .slice(0, inputLetters.length)
        .toLowerCase();
      if (midWordSubstring === inputLetters) {
        return midWordIndex;
      }
      if (midWordSubstring < inputLetters) {
        low = midWordIndex + 1;
      } else if (midWordSubstring > inputLetters) {
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
      const midWordSubstring = sortedOptions[midWordIndex]
        .slice(0, inputLetters.length)
        .toLowerCase();
      if (midWordIndex === 0 || midWordIndex >= options.length) {
        return midWordIndex;
      }
      const previousSubstring = sortedOptions[midWordIndex - 1]
        .slice(0, inputLetters.length)
        .toLowerCase();
      const nextSubstring = sortedOptions[midWordIndex + 1]
        .slice(0, inputLetters.length)
        .toLowerCase();
      if (
        ((feature === 'left' && previousSubstring !== inputLetters) ||
          (nextSubstring !== inputLetters && feature === 'right')) &&
        midWordSubstring === inputLetters
      ) {
        return midWordIndex;
      }
      if (
        (feature === 'left' && midWordSubstring === inputLetters) ||
        (feature === 'right' && midWordSubstring > inputLetters)
      ) {
        high = midWordIndex;
      }
      if (
        (feature === 'right' && midWordSubstring === inputLetters) ||
        (feature === 'left' && midWordSubstring < inputLetters)
      ) {
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

    const previousSubstring = sortedOptions[midWord - 1]
      .slice(0, inputLetters.length)
      .toLowerCase();

    if (previousSubstring !== inputLetters) return midWord;

    return filterLeftRightOptions(low, high, 'left');
  };

  const filterRightOptions = () => {
    const low = midWord;
    const high = options.length - 1;

    if (midWord >= options.length - 1 || !midWord) {
      return midWord;
    }

    const nextSubstring = sortedOptions[midWord + 1].slice(0, inputLetters.length).toLowerCase();

    if (nextSubstring !== inputLetters) return midWord;

    return filterLeftRightOptions(low, high, 'right');
  };
  const filteredHintsList = sortedOptions.slice(filterLeftOptions(), filterRightOptions() + 1);
  return filteredHintsList;
};

export default filterWords;
