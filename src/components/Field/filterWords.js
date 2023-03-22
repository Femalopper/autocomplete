/* eslint consistent-return: off */

const filterLeftRightOptions = (l, h, feature, inputLetters, sortedOptions, options) => {
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

export default filterLeftRightOptions;
