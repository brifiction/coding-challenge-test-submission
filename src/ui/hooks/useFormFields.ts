import { useState } from 'react';

type FormFields = {
  postCode: string;
  houseNumber: string;
  firstName: string;
  lastName: string;
  selectedAddress: string;
};

export const useFormFields = () => {
  const [formFields, setFormFields] = useState<FormFields>({
    postCode: '',
    houseNumber: '',
    firstName: '',
    lastName: '',
    selectedAddress: ''
  });

  const handleChange = (field: keyof FormFields) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormFields(previous => ({
      ...previous,
      [field]: e.target.value
    }));
  };

  const resetFormFields = () => {
    setFormFields({
      postCode: '',
      houseNumber: '',
      firstName: '',
      lastName: '',
      selectedAddress: ''
    });
  };

  return {
    formFields,
    handleChange,
    resetFormFields
  };
};
