import {useTheme} from '@app/providers/theme-provider';
import type * as React from 'react';
import {TextInput, type TextInputProps} from 'react-native';

export function Input(props: React.PropsWithChildren<TextInputProps>) {
  const {colors} = useTheme();
  return (
    <TextInput
      {...props}
      style={[
        {
          height: 28,
          paddingHorizontal: 8,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: colors.border,
          color: colors.text,
          backgroundColor: colors.surface,
        },
        props.style,
      ]}
    >
      {props.children}
    </TextInput>
  );
}
