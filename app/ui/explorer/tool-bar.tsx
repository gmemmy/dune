import {useTheme} from '@app/providers/theme-provider';
import {Input} from '@app/ui/primitives/input';
import {Text, View} from 'react-native';

type Props = {
  cwd: string;
  count: number;
  onEnterPath: (v: string) => void;
};

export function Toolbar({cwd, count, onEnterPath}: Props) {
  const {colors} = useTheme();
  return (
    <View
      style={{
        height: 38,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Input value={cwd} onChangeText={onEnterPath} />
      <Text style={{marginLeft: 8, color: colors.muted}}>{count} items</Text>
    </View>
  );
}
