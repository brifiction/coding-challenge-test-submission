import getAddresses from '../getAddresses';

// Mock the generateMockAddresses utility
jest.mock('../../../src/utils/generateMockAddresses', () => {
  return jest.fn((postcode: string, streetNumber: string) => {
    const postcodeFirstChar = parseInt(postcode.substring(0, 1));
    const streetNumberFirstChar = parseInt(streetNumber.substring(0, 1));
    
    const postCodeToCityMapping: any = {
      1: 'Brisbane', 2: 'Sydney', 3: 'Melbourne', 4: 'Gold Coast',
      5: 'Toowomba', 6: 'Burleigh', 7: 'Byron Bay', 8: 'Geelong', 9: 'Warrnambool'
    };
    
    const streetNumberToStreetMapping: any = {
      1: 'Mary Street', 2: 'Edward Street', 3: 'Francesco Street',
      4: 'Docklands Drive', 5: 'Elizabeth Street', 6: 'Black Spur Drive',
      7: 'Grand Pacific Drive', 8: 'Paddys River Road', 9: 'Red Centre Way'
    };
    
    const postcodeMapping = postCodeToCityMapping[postcodeFirstChar];
    const streetMapping = streetNumberToStreetMapping[streetNumberFirstChar];
    
    if (postcodeMapping) {
      return [
        { city: postcodeMapping, houseNumber: '1', postcode, street: `${streetNumber} ${streetMapping}`, lat: Math.random(), long: Math.random() },
        { city: postcodeMapping, houseNumber: '2', postcode, street: `${streetNumber} ${streetMapping}`, lat: Math.random(), long: Math.random() },
        { city: postcodeMapping, houseNumber: '3', postcode, street: `${streetNumber} ${streetMapping}`, lat: Math.random(), long: Math.random() }
      ];
    }
    return null;
  });
});

describe('/api/getAddresses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (query: any) => ({ query });
  
  const createMockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res._getStatusCode = () => res.status.mock.calls[0]?.[0];
    res._getData = () => res.send.mock.calls[0]?.[0] || res.json.mock.calls[0]?.[0];
    return res;
  };

  const testApiCall = async (query: any, expectedStatus: number, expectedData?: any) => {
    const req = createMockRequest(query);
    const res = createMockResponse();
    
    await getAddresses(req as any, res);
    
    expect(res._getStatusCode()).toBe(expectedStatus);
    if (expectedData) {
      expect(res._getData()).toEqual(expectedData);
    }
  };

  describe('validation errors', () => {
    const testValidationError = (query: any, expectedMessage: string) => {
      it(`should return 400 for ${JSON.stringify(query)}`, async () => {
        await testApiCall(query, 400, {
          status: 'error',
          errormessage: expectedMessage
        });
      });
    };

    testValidationError({ streetnumber: '10' }, 'Postcode and street number fields mandatory!');
    testValidationError({ postcode: '1234' }, 'Postcode and street number fields mandatory!');
    testValidationError({ postcode: '123', streetnumber: '10' }, 'Postcode must be at least 4 digits!');
    testValidationError({ postcode: '12a4', streetnumber: '10' }, 'Postcode must be all digits and non negative!');
    testValidationError({ postcode: '-1234', streetnumber: '10' }, 'Postcode must be all digits and non negative!');
    testValidationError({ postcode: '1234', streetnumber: '1a0' }, 'Street Number must be all digits and non negative!');
    testValidationError({ postcode: '1234', streetnumber: '-10' }, 'Street Number must be all digits and non negative!');
    testValidationError({ postcode: '', streetnumber: '' }, 'Postcode and street number fields mandatory!');
    testValidationError({ postcode: '   ', streetnumber: '   ' }, 'Postcode must be at least 4 digits!');
  });

  describe('success address test cases', () => {
    it('should return 200 with addresses for valid data', async () => {
      const req = createMockRequest({ postcode: '1234', streetnumber: '10' });
      const res = createMockResponse();

      await getAddresses(req as any, res);

      expect(res._getStatusCode()).toBe(200);
      const data = res._getData();
      expect(data.status).toBe('ok');
      expect(data.details).toHaveLength(3);
      expect(data.details[0]).toMatchObject({
        city: 'Brisbane',
        houseNumber: '1',
        postcode: '1234',
        street: '10 Mary Street'
      });
    });
  });

  describe('no results', () => {
    it('should return 404 when no addresses found', async () => {
      await testApiCall({ postcode: '0000', streetnumber: '000' }, 404, {
        status: 'error',
        errormessage: 'No results found!'
      });
    });
  });
});
