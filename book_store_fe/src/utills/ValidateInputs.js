const validateInputs = (listErr, fields, rules, setListErr) => {
    let isValid = true;
    const newListErr = { ...listErr };
    const validators = {
        required: (value) => value.trim().length > 0,
        emailFormat: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.trim().length === 0,
        match: (value, matchValue) => value === matchValue,
        requiredObject: (object) => Boolean(object),
    };

    rules.forEach(({ field, validations }) => {
        validations.forEach(({ type, matchField }) => {
            if (field === 'confirmPassword') {
                newListErr[field].required = !validators.required(fields[field]);
                newListErr[field].match = !validators.match(fields[field], fields[matchField]);
                if (newListErr[field].required || newListErr[field].match) {
                    isValid = false;
                } else {
                    isValid = true;
                }
                return;
            }            
            const value = fields[field];
            const matchValue = matchField ? fields[matchField] : null;
            const isValidField = validators[type](value, matchValue);
            if (!isValidField) {
                newListErr[type === 'emailFormat' ? `${field}Format` : field] = true;
                isValid = false;
            } else {
                newListErr[type === 'emailFormat' ? `${field}Format` : field] = false;
            }
        });
    });
    setListErr(newListErr);
    return isValid;
};

const registerRules = [
    { field: 'email', validations: [{ type: 'required' }, { type: 'emailFormat' }] },
    { field: 'fullname', validations: [{ type: 'required' }] },
    { field: 'phoneNum', validations: [{ type: 'required' }] },
    { field: 'password', validations: [{ type: 'required' }] },
    { field: 'confirmPassword', validations: [{ type: 'required' }, { type: 'match', matchField: 'password' }] },
    { field: 'province', validations: [{ type: 'requiredObject' }] },
    { field: 'district', validations: [{ type: 'requiredObject' }] },
    { field: 'commune', validations: [{ type: 'requiredObject' }] },
    { field: 'addressDetail', validations: [{ type: 'required' }] },
];

const loginRules = [
    { field: 'email', validations: [{ type: 'required' }, { type: 'emailFormat' }] },
    { field: 'password', validations: [{ type: 'required' }] },
];

const forgetPassRules = [
    { field: 'email', validations: [{ type: 'required' }, { type: 'emailFormat' }] },
];

const changePassRules = [
    { field: 'password', validations: [{ type: 'required' }] },
    { field: 'newPassword', validations: [{ type: 'required' }] },
    { field: 'confirmPassword', validations: [{ type: 'required' }, { type: 'match', matchField: 'newPassword' }] },
];

const setNewPass = [
    { field: 'newPassword', validations: [{ type: 'required' }] },
    { field: 'confirmPassword', validations: [{ type: 'required' }, { type: 'match', matchField: 'newPassword' }] },
];

export const validateInputsRegister = (listErr, fields, setListErr) =>
    validateInputs(listErr, fields, registerRules, setListErr);
export const validateInputsLogin = (listErr, fields, setListErr) =>
    validateInputs(listErr, fields, loginRules, setListErr);
export const validateInputsForgetPass = (listErr, fields, setListErr) =>
    validateInputs(listErr, fields, forgetPassRules, setListErr);
export const validateInputChangePass = (listErr, fields, setListErr) =>
    validateInputs(listErr, fields, changePassRules, setListErr);
export const validateInputSetNewPass = (listErr, fields, setListErr) =>
    validateInputs(listErr, fields, setNewPass, setListErr);

