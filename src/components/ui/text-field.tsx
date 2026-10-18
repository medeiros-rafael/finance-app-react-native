import { useState, type Ref } from 'react';
import {
  type TextInput as NativeTextInput,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { HelperText, TextInput, type TextInputProps } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { radius, useAppTheme } from '@/theme';

import { glassSurface } from './glass';

type Props = Omit<TextInputProps, 'error' | 'label' | 'mode' | 'left' | 'right' | 'style' | 'theme'> & {
  label: string;
  error?: string;
  supportingText?: string;
  leftIcon?: string;
  password?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  ref?: Ref<NativeTextInput>;
};

export function TextField({
  label,
  error,
  supportingText,
  leftIcon,
  password = false,
  containerStyle,
  ref,
  onFocus,
  onBlur,
  ...inputProps
}: Props) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const helper = error ?? supportingText;
  const edge = error ? theme.colors.error : focused ? theme.colors.primary : theme.glass.border;

  return (
    <View style={containerStyle}>
      <View
        style={[
          glassSurface(theme, radius.md),
          styles.shell,
          { borderColor: edge },
          (focused || !!error) && styles.shellActive,
        ]}
      >
        <TextInput
          ref={ref}
          mode="flat"
          label={label}
          error={!!error}
          secureTextEntry={password && !visible}
          autoCapitalize={password ? 'none' : inputProps.autoCapitalize}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          underlineStyle={styles.noUnderline}
          style={styles.input}
          left={
            leftIcon ? (
              <TextInput.Icon
                icon={leftIcon}
                color={focused ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
            ) : undefined
          }
          right={
            password ? (
              <TextInput.Icon
                icon={visible ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setVisible((value) => !value)}
                forceTextInputFocus={false}
                accessibilityLabel={visible ? t('common.hidePassword') : t('common.showPassword')}
              />
            ) : undefined
          }
          aria-label={label}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />
      </View>
      {helper ? (
        <HelperText type={error ? 'error' : 'info'} visible padding="normal">
          {helper}
        </HelperText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { overflow: 'hidden' },
  shellActive: { borderWidth: 1.5 },
  input: { backgroundColor: 'transparent' },
  noUnderline: { display: 'none' },
});
