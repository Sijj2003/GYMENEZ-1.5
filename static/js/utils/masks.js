// static/js/utils/masks.js

export function applyDateMask(e) {
    if (e.inputType === 'deleteContentBackward') return; 
    const input = e.target;
    const oldCursorPos = input.selectionStart;
    const oldVal = input.value;
    
    let v = oldVal.replace(/\D/g, ''); 
    if (v.length > 8) v = v.substring(0, 8);
    
    let formatted = v;
    if (v.length >= 5) formatted = `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;
    else if (v.length >= 3) formatted = `${v.substring(0, 2)}/${v.substring(2)}`;
    
    const oldNonDigitCount = (oldVal.match(/\//g) || []).length;
    const newNonDigitCount = (formatted.match(/\//g) || []).length;
    const netChange = newNonDigitCount - oldNonDigitCount;
    
    input.value = formatted;
    const newCursorPos = oldCursorPos + netChange;
    input.setSelectionRange(newCursorPos, newCursorPos);
}

export function applyCIMask(e) {
    const input = e.target;
    const oldCursorPos = input.selectionStart;
    const oldVal = input.value;
    
    let v = oldVal.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    
    let formatted = '';
    let count = 0;
    for (let i = v.length - 1; i >= 0; i--) {
        formatted = v[i] + formatted;
        count++;
        if (count % 3 === 0 && i !== 0) formatted = '.' + formatted;
    }
    
    const oldNonDigitCount = (oldVal.match(/\./g) || []).length;
    const newNonDigitCount = (formatted.match(/\./g) || []).length;
    const netChange = newNonDigitCount - oldNonDigitCount;
    
    input.value = formatted;
    const newCursorPos = oldCursorPos + netChange;
    input.setSelectionRange(newCursorPos, newCursorPos);
}

export function applyPhoneMask(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 7);
}
