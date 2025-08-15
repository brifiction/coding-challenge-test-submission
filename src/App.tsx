import React from "react";

import Address from "@/components/Address/Address";
import AddressBook from "@/components/AddressBook/AddressBook";
import Button from "@/components/Button/Button";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import Form from "@/components/Form/Form";
// import InputText from "@/components/InputText/InputText";
import Radio from "@/components/Radio/Radio";
import Section from "@/components/Section/Section";
import useAddressBook from "@/hooks/useAddressBook";
import { useFormFields } from "@/hooks/useFormFields";

// import styles from "./App.module.css";
import { Address as AddressType } from "./types";

function App() {
  /**
   * Form fields states
   * TODO: Write a custom hook to set form fields in a more generic way:
   * - Hook must expose an onChange handler to be used by all <InputText /> and <Radio /> components
   * - Hook must expose all text form field values, like so: { postCode: '', houseNumber: '', ...etc }
   * - Remove all individual React.useState
   * - Remove all individual onChange handlers, like handlePostCodeChange for example
   */
  const { formFields, handleChange, resetFormFields } = useFormFields();
  
  /**
   * Results states
   */
  const [error, setError] = React.useState<undefined | string>(undefined);
  const [addresses, setAddresses] = React.useState<AddressType[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = React.useState(false);
  /**
   * Redux actions
   */
  const { addAddress } = useAddressBook();

  /** TODO: Fetch addresses based on houseNumber and postCode using the local BE api
   * - Example URL of API: ${process.env.NEXT_PUBLIC_URL}/api/getAddresses?postcode=1345&streetnumber=350
   * - Ensure you provide a BASE URL for api endpoint for grading purposes!
   * - Handle errors if they occur
   * - Handle successful response by updating the `addresses` in the state using `setAddresses`
   * - Make sure to add the houseNumber to each found address in the response using `transformAddress()` function
   * - Ensure to clear previous search results on each click
   * - Bonus: Add a loading state in the UI while fetching addresses
   */
  const clearAddressSearchResults = () => {
    setAddresses([]);
    setError(undefined);
    setIsLoadingAddresses(true);
  }

  const handleAddressSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    clearAddressSearchResults();
    
    const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const url = `${BASE_URL}/api/getAddresses?postcode=${formFields.postCode}&streetnumber=${formFields.houseNumber}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'ok' && data.details) {
        const processedAddresses = data.details.map((address: any, index: number) => ({
          ...address,
          houseNumber: formFields.houseNumber,
          id: `address-${index}-${Date.now()}`
        }));
        setAddresses(processedAddresses);
      } else {
        setError(data.errormessage || 'No addresses found');
      }
    } catch (error) {
      setError('Failed to fetch addresses');
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  /** TODO: Add basic validation to ensure first name and last name fields aren't empty
   * Use the following error message setError("First name and last name fields mandatory!")
   */
  const handlePersonSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate first name and last name fields
    if (!formFields.firstName.trim() || !formFields.lastName.trim()) {
      setError("First name and last name fields mandatory!");
      return;
    }

    if (!formFields.selectedAddress || !addresses.length) {
      setError(
        "No address selected, try to select an address or find one if you haven't"
      );
      return;
    }

    const foundAddress = addresses.find(
      (address) => address.id === formFields.selectedAddress
    );

    if (!foundAddress) {
      setError("Selected address not found");
      return;
    }

    addAddress({ ...foundAddress, firstName: formFields.firstName, lastName: formFields.lastName });
  };

  const handleClearAllFields = () => {
    // Clear all form fields
    resetFormFields();
    // Remove all search results
    setAddresses([]);
    // Clear all prior error messages
    setError(undefined);
  };

  const addressFormEntries = [
    {
      name: "postCode",
      placeholder: "Post Code",
      extraProps: {
        value: formFields.postCode,
        onChange: handleChange('postCode')
      }
    },
    {
      name: "houseNumber",
      placeholder: "House number",
      extraProps: {
        value: formFields.houseNumber,
        onChange: handleChange('houseNumber')
      }
    }
  ];

  const personFormEntries = [
    {
      name: "firstName",
      placeholder: "First name",
      extraProps: {
        value: formFields.firstName,
        onChange: handleChange('firstName')
      }
    },
    {
      name: "lastName",
      placeholder: "Last name",
      extraProps: {
        value: formFields.lastName,
        onChange: handleChange('lastName')
      }
    }
  ];

  return (
    <main>
      <Section>
        <h1>
          Create your own address book!
          <br />
          <small>
            Enter an address by postcode add personal info and done! 👏
          </small>
        </h1>
        
        <Form
          label="🏠 Find an address"
          loading={isLoadingAddresses}
          formEntries={addressFormEntries}
          onFormSubmit={handleAddressSubmit}
          submitText={isLoadingAddresses ? 'Finding...' : 'Find'}
        />

        {addresses.length > 0 &&
          addresses.map((address) => {
            return (
              <Radio
                name="selectedAddress"
                id={address.id}
                key={address.id}
                onChange={handleChange('selectedAddress')}
              >
                <Address {...address} />
              </Radio>
            );
          })}

        {formFields.selectedAddress && (
          <Form
            label="✏️ Add personal info to address"
            loading={false}
            formEntries={personFormEntries}
            onFormSubmit={handlePersonSubmit}
            submitText="Add to addressbook"
          />
        )}

        {/* TODO: Create an <ErrorMessage /> component for displaying an error message */}
        {error && <ErrorMessage message={error} />}

        {/* TODO: Add a button to clear all form fields. 
        Button must look different from the default primary button, see design. 
        Button text name must be "Clear all fields"
        On Click, it must clear all form fields, remove all search results and clear all prior
        error messages
        */}
        <Button variant="secondary" onClick={handleClearAllFields}>
          Clear all fields
        </Button>
      </Section>

      <Section variant="dark">
        <AddressBook />
      </Section>
    </main>
  );
}

export default App;
