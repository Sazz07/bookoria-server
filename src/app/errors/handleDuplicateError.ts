/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from 'http-status';
import { TErrorSources, TGenericErrorResponse } from '../interface/error';

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const match = err.message.match(/"([^"]*)"/);
  const extractedMessage = match && match[1];

  const errorSources: TErrorSources = [
    {
      path: '',
      message: `${extractedMessage} is already exists`,
    },
  ];

  return {
    statusCode: httpStatus.CONFLICT,
    message: 'Duplicate Field Value',
    errorSources,
  };
};

export default handleDuplicateError;
