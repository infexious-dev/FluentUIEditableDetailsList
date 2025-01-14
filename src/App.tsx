import React from 'react';
import { Stack, IStackTokens, IStackStyles } from '@fluentui/react';
import Consumer from './Examples/gridconsumer/gridconsumer';
const stackTokens: IStackTokens = { childrenGap: 15 };
const stackStyles: Partial<IStackStyles> = {
  root: {
    width: '960px',
    margin: '0 auto',
    textAlign: 'center',
    color: '#605e5c',
  },
};

export const App: React.FunctionComponent = () => {
  return (
    <Stack horizontalAlign="center" verticalAlign="center" verticalFill styles={stackStyles} tokens={stackTokens}>
      <Consumer />
    </Stack>
  );
};
