import React from 'react';

import { useWeb3React } from '@web3-react/core';
import { NavLink } from 'react-router-dom';

import { makeStyles, Hidden } from '@material-ui/core';

import { ReactComponent as CoinbaseSVG } from 'assets/svgs/wallet/coinbase.svg';
import { ReactComponent as MetaMaskSVG } from 'assets/svgs/wallet/metamask-color.svg';
import { ReactComponent as WalletConnectSVG } from 'assets/svgs/wallet/wallet-connect.svg';
import { ApeAvatar } from 'components';
import { menuGroupStyle } from 'components/MainLayout/MainHeader';
import { EConnectorNames } from 'config/constants';
import { useApiBase } from 'hooks';
import useConnectedAddress from 'hooks/useConnectedAddress';
import { useMyProfile } from 'recoilState/app';
import { EXTERNAL_URL_DOCS, paths } from 'routes/paths';
import {
  Box,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from 'ui';
import { shortenAddress } from 'utils';
import { connectors } from 'utils/connectors';

const useStyles = makeStyles(theme => ({
  avatarButton: {
    marginLeft: theme.spacing(1.5),
    height: '50px',
    width: '50px',
    cursor: 'pointer',
  },
}));

export const MyAvatarMenu = () => {
  const classes = useStyles();
  const myProfile = useMyProfile();
  const { icon, address, logout } = useWalletStatus();

  return (
    <>
      <Hidden smDown>
        <Popover>
          <PopoverTrigger asChild>
            <Link href="#">
              <ApeAvatar profile={myProfile} className={classes.avatarButton} />
            </Link>
          </PopoverTrigger>
          <PopoverContent
            // These offset values must be dialed in browser.  CSS values/strings cannot be used, only numbers.
            sideOffset={-67}
            alignOffset={-16}
            css={{ background: '$surface' }}
          >
            <Box
              css={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'right',
                alignItems: 'end',
                p: 'calc($md + $xs)',
              }}
            >
              <PopoverClose asChild>
                <Box css={{ display: 'flex', alignItems: 'end', pb: '$md' }}>
                  <ApeAvatar
                    className={classes.avatarButton}
                    profile={myProfile}
                  />
                </Box>
              </PopoverClose>
              <Box
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: '$xs',
                  fontWeight: '$bold',
                  fontSize: '$large',
                }}
              >
                <Box css={{ mr: '$sm', display: 'flex' }}>{icon}</Box>
                {address && shortenAddress(address)}
              </Box>
              <Link
                type="menu"
                css={{ fontSize: '$xs', color: '$headingText' }}
                onClick={logout}
              >
                Disconnect
              </Link>
              <Box css={menuGroupStyle}>
                <Link type="menu" as={NavLink} to={paths.profile('me')}>
                  Profile
                </Link>
                <Link type="menu" as={NavLink} to={paths.circles}>
                  Circles
                </Link>
              </Box>
              <Box css={menuGroupStyle}>
                <Link type="menu" href={EXTERNAL_URL_DOCS}>
                  Docs
                </Link>
                <Link
                  type="menu"
                  href="https://notionforms.io/forms/give-us-your-feedback-improve-coordinape"
                  target="_blank"
                >
                  Give Feedback
                </Link>
              </Box>
            </Box>
          </PopoverContent>
        </Popover>
      </Hidden>
    </>
  );
};

type Connector = Exclude<
  ReturnType<typeof useWeb3React>['connector'],
  undefined
>;

const connectorIcon = (connector: Connector | undefined) => {
  if (!connector) return null;

  const name = Object.entries(connectors).find(
    ([, ctr]) => connector.constructor === ctr.constructor
  )?.[0];

  switch (name) {
    case EConnectorNames.Injected:
      return <MetaMaskSVG />;
    case EConnectorNames.WalletConnect:
      return <WalletConnectSVG />;
    case EConnectorNames.WalletLink:
      return <CoinbaseSVG />;
  }
  return null;
};

export const useWalletStatus = () => {
  const { connector, deactivate } = useWeb3React();
  const address = useConnectedAddress();
  const { logout } = useApiBase();

  return {
    icon: connectorIcon(connector),
    address,
    logout: () => {
      deactivate();
      logout();
    },
  };
};
