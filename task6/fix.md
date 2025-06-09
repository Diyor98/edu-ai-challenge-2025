# Enigma Machine Bug Fixes

## Issues Identified

The original Enigma implementation had two critical bugs that prevented correct encryption/decryption:

### 1. Missing Plugboard at Output

**Bug**: The plugboard transformation was only applied at the input stage, not at the output stage.

**Problem**: In a real Enigma machine, the electrical signal passes through the plugboard twice - once when entering the machine and once when exiting. The original code only applied the plugboard swap at the beginning of the encryption process.

**Fix**: Added `plugboardSwap(c, this.plugboardPairs)` at the end of the `encryptChar()` method.

**Impact**: Without this fix, encryption and decryption were not reciprocal operations.

### 2. Incorrect Rotor Stepping (Double-Stepping)

**Bug**: The middle rotor did not step itself when it was at the notch position, breaking the famous Enigma "double-stepping" mechanism.

**Problem**: The original stepping logic was:

```javascript
if (this.rotors[2].atNotch()) this.rotors[1].step();
if (this.rotors[1].atNotch()) this.rotors[0].step();
this.rotors[2].step();
```

This meant when the middle rotor reached its notch, it would cause the left rotor to step, but the middle rotor itself wouldn't step on that same keystroke.

**Fix**: Implemented proper double-stepping logic:

- Right rotor always steps
- Middle rotor steps if right rotor is at notch OR if middle rotor itself is at notch
- Left rotor steps if middle rotor is at notch

**Impact**: Incorrect rotor positions led to wrong encryption sequences and broke the machine's authenticity.

## Result

These fixes restore the authentic Enigma behavior where the same settings used to encrypt a message will correctly decrypt it back to the original text, making the implementation reciprocal as expected.
