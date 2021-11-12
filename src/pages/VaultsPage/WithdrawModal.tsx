import { useMemo } from 'react';

import { useHistory } from 'react-router-dom';

import { makeStyles } from '@material-ui/core';

import { FormModal, FormTextField } from 'components';
import AdminVaultForm from 'forms/AdminVaultForm';
import { useAdminApi } from 'hooks';
import { MinusCircleIcon } from 'icons';
import { useSelectedCircle } from 'recoilState';
import { assertDef } from 'utils/tools';

import { IUser } from 'types';

const useStyles = makeStyles(theme => ({
  modalBody: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oneColumn: {
    marginTop: theme.spacing(12),
    marginBottom: theme.spacing(12),
  },
  ethInput: {
    width: '100%',
    gridColumn: '1 / span 2',
  },
  helperBox: {
    height: 0,
  },
  label: {
    margin: theme.spacing(0, 0, 2),
    fontSize: 16,
    fontWeight: 300,
    lineHeight: 1.2,
    color: theme.colors.text,
    textAlign: 'center',
  },
}));

interface WithdrawModalProps {
  onClose: any;
  openwd: boolean;
  user?: IUser;
}

export default function WithdrawModal({
  openwd,
  onClose,
  user,
}: WithdrawModalProps) {
  const classes = useStyles();
  const selectedCircle = useSelectedCircle();
  const { updateUser } = useAdminApi();
  const history = useHistory();

  const handleClose = () => {
    onClose(false);
  };

  const source = useMemo(
    () => ({
      user: user,
      circle: assertDef(selectedCircle, 'Missing circle'),
    }),
    [user, selectedCircle]
  );

  const routeChange = () => {
    const path = '/admin/vaults';
    history.push(path);
  };

  //   TODO: Pull in real data to populate FormTextField label and update value

  return (
    <AdminVaultForm.FormController
      source={source}
      hideFieldErrors
      submit={params => user && updateUser(user.address, params)}
    >
      {({ fields: { ...fields } }) => (
        <FormModal
          onClose={handleClose}
          open={openwd}
          title={'Withdraw USDC from the Coordinape Vault'}
          subtitle={''}
          onSubmit={routeChange}
          submitDisabled={false}
          size="small"
          icon={<MinusCircleIcon />}
          submitText={` Withdraw USDC`}
        >
          <div className={classes.oneColumn}>
            <FormTextField
              {...fields.starting_tokens}
              InputProps={{ startAdornment: 'MAX', endAdornment: 'USDC' }}
              label="Available: 264,600 USDC"
              apeVariant="token"
            />
          </div>
        </FormModal>
      )}
    </AdminVaultForm.FormController>
  );
}
