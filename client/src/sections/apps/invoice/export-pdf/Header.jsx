import PropTypes from 'prop-types';
// material-ui
import { alpha, useTheme } from '@mui/material/styles';

// third-party
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

// assets
// import Logo from 'components/logo/LogoIcon';
// import Logo from 'assets/images/logo.png';
import Logo from 'assets/images/logo.png';
const textPrimary = '#262626';
const textSecondary = '#454444ff';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row'
  },
  detailColumn: {
    marginBottom: '12px',
    flexDirection: 'column',
    flexGrow: 2
  },
  chipTitle: {
    fontSize: '8px',
    padding: 4
  },
  chip: {
    alignItems: 'center',
    borderRadius: '4px',
    marginLeft: 52,
    marginRight: 4,
    marginBottom: 8
  },
  leftColumn: {
    flexDirection: 'column',
    width: 36,
    marginRight: 10,
    paddingLeft: 4,
    marginTop: 4
  },
  image: {
    width: 90,
    height: 28
  },
  mainContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end'
  },
  title: {
    color: textPrimary,
    fontSize: '10px'
  },
  caption: {
    color: textSecondary,
    fontSize: '10px'
  }
});

// ==============================|| INVOICE EXPORT - HEADER  ||============================== //

export default function Header({ list }) {
  const theme = useTheme();

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <View style={styles.leftColumn}>
          <Image src={Logo} style={styles.image} />

          <Text style={[styles.caption, { marginTop: 4 }]}>{`#${list?.invoice_id}`}</Text>
        </View>
        <View style={styles.detailColumn}>
          <View
            style={[
              styles.chip,
              {
                backgroundColor:
                  list?.status === 'paid' || list?.status === 'paid'
                    ? alpha(theme.palette.success.light, 0.2)
                    : list?.status === 'unpaid' || list?.status === 'unpaid'
                      ? alpha(theme.palette.error.light, 0.2)
                      : list?.status === 'pending' || list?.status === 'pending'
                        ? alpha(theme.palette.warning.light, 0.2)
                        : alpha(theme.palette.error.light, 0.2) // Default for any other status
              }
            ]}
          >
            <Text
              style={[
                styles.chipTitle,
                {
                  color:
                    list?.status === 'paid' || list?.status === 'paid'
                      ? theme.palette.success.main
                      : list?.status === 'unpaid' || list?.status === 'unpaid'
                        ? theme.palette.error.main
                        : list?.status === 'pending' || list?.status === 'pending'
                          ? theme.palette.warning.main
                          : theme.palette.error.main // Default for any other status
                }
              ]}
            >
              {list?.status}
            </Text>
          </View>
        </View>
      </View>
      <View>
        <View style={[styles.row, { marginTop: 8 }]}>
          <Text style={styles.title}>Date</Text>
          {/* <Text style={styles.caption}> {list?.date && format(new Date(list?.date), 'dd/MM/yyyy')}</Text> */}
          <Text style={styles.caption}>
            {list?.date && !isNaN(new Date(list.date).getTime()) ? format(new Date(list.date), 'dd/MM/yyyy') : 'N/A'}
          </Text>
        </View>
        <View style={[styles.row, { marginTop: 8 }]}>
          {/* <Text style={styles.title}>Due Date</Text> */}
          <Text style={styles.caption}> {list?.due_date && format(new Date(list?.due_date), 'dd/MM/yyyy')}</Text>
        </View>
      </View>
    </View>
  );
}

Header.propTypes = { list: PropTypes.any };
