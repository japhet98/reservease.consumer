import { ApiResponse } from '../ApiResponse';

const apiRes: any = {
  code: 200,
  message: 'tested',
  data: [],
};

test('Api Response', () => {
  expect(new ApiResponse<any>(200, 'tested', [])).toEqual(apiRes);
});

const apiRes2: any = {
  code: 200,
  message: 'tested',
  data: undefined,
};

test('Api Response', () => {
  expect(new ApiResponse<any>(200, 'tested')).toEqual(apiRes2);
});
