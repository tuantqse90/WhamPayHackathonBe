export const  getRandom = (min: number, max: number): number => {
    const value = Math.random() * (max - min) + min;
    // Determine the maximum decimal places from min and max
    const minDecimals = (min.toString().split('.')[1] || '').length;
    const maxDecimals = (max.toString().split('.')[1] || '').length;
    const decimalPlaces = Math.max(minDecimals, maxDecimals, 6); // At least 6 decimal places
    return parseFloat(value.toFixed(decimalPlaces));
  }