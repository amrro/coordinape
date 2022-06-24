import { useEffect, useMemo, useState } from 'react';

import { GearIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from 'stitches.config';

import { NoticeBox } from 'components';
import {
  USER_COORDINAPE_ADDRESS,
  USER_ROLE_ADMIN,
  USER_ROLE_COORDINAPE,
} from 'config/constants';
import { isFeatureEnabled } from 'config/features';
import { useApiAdminCircle, useNavigation } from 'hooks';
import useMobileDetect from 'hooks/useMobileDetect';
import { PlusCircleIcon, CheckIcon, CloseIcon } from 'icons';
import { paths } from 'routes/paths';
import { Avatar, Box, Button, Flex, IconButton, Link, Tooltip, Text } from 'ui';
import { shortenAddress } from 'utils';

import { Paginator } from './Paginator';
import * as Table from './Table';

import { ICircle, IEpoch, IUser } from 'types';

const Title = styled(Text, {
  fontSize: '$4',
  fontWeight: '$medium',
  color: '$primary',
  flexGrow: 1,
});

const Subtitle = styled(Text, {
  fontSize: '$3',
  fontWeight: '$light',
  color: '$primary',
});

const LightText = styled(Text, {
  fontSize: '$3',
  fontWeight: '$normal',
  color: '$secondaryText',
});

export const SettingsIconButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <IconButton size="lg" onClick={onClick}>
      <GearIcon width="30" height="30" />
    </IconButton>
  );
};

export const CreateEpochButton = ({
  onClick,
  tokenName,
  inline,
}: {
  inline?: boolean;
  tokenName: string;
  onClick: () => void;
}) => {
  return (
    <Button
      color="primary"
      outlined
      size={inline ? 'inline' : 'medium'}
      onClick={onClick}
      css={{ minWidth: '180px' }}
    >
      Create Epoch
      <Tooltip
        content={
          <>
            An Epoch is a period of time where circle members contribute value &
            allocate {tokenName} tokens to one another.{' '}
            <Link
              css={{ color: 'Blue' }}
              rel="noreferrer"
              target="_blank"
              href="https://docs.coordinape.com/get-started/epochs"
            >
              Learn More
            </Link>
          </>
        }
      >
        <InfoCircledIcon />
      </Tooltip>
    </Button>
  );
};

export const AddContributorButton = ({
  onClick,
  tokenName,
  inline,
}: {
  inline?: boolean;
  tokenName: string;
  onClick: () => void;
}) => {
  return (
    <Button
      color="primary"
      outlined
      size={inline ? 'inline' : 'medium'}
      onClick={onClick}
      css={{ minWidth: '180px' }}
    >
      Add Contributor
      <Tooltip
        content={
          <>
            A member of a circle that can receive {tokenName} or kudos for
            contributions performed.{' '}
            <Link
              css={{ color: 'Blue' }}
              rel="noreferrer"
              target="_blank"
              href="https://docs.coordinape.com/get-started/members"
            >
              Learn More
            </Link>
          </>
        }
      >
        <InfoCircledIcon />
      </Tooltip>
    </Button>
  );
};

export const UsersTableHeader = ({
  tokenName,
  onClick,
}: {
  onClick: () => void;
  tokenName: string;
}) => {
  return (
    <Box
      css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 'auto',
        marginTop: '$xl',
      }}
    >
      <Text h3>Users</Text>
      <AddContributorButton inline onClick={onClick} tokenName={tokenName} />
    </Box>
  );
};

export const EpochsTableHeader = ({
  tokenName,
  onClick,
}: {
  onClick: () => void;
  tokenName: string;
}) => {
  return (
    <Box
      css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 'auto',
        my: '$md',
      }}
    >
      <Text h3>Epochs</Text>
      <CreateEpochButton inline onClick={onClick} tokenName={tokenName} />
    </Box>
  );
};

const RenderEpochDates = (e: IEpoch) => (
  <Flex
    css={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: '$sm',
    }}
  >
    <LightText>
      {e.labelYearEnd} - {e.labelDayRange}
    </LightText>
    <LightText>{e.ended ? e.labelTimeEnd : e.labelTimeStart}</LightText>
  </Flex>
);

const renderEpochDuration = (e: IEpoch) => {
  const repeats =
    e.repeatEnum == 'none' ? "doesn't repeat" : `repeats ${e.repeatEnum}`;
  return `${e.calculatedDays} days, ${repeats}`;
};

export const RenderEpochStatus = (e: IEpoch) =>
  e.ended ? (
    <NoticeBox variant="error">Complete</NoticeBox>
  ) : e.started ? (
    <NoticeBox variant="success">Current</NoticeBox>
  ) : (
    <NoticeBox variant="warning">Upcoming</NoticeBox>
  );

export const renderEpochCard = (e: IEpoch) => {
  return (
    <Flex
      css={{
        flexDirection: 'column',
        width: 'auto',
        margin: '$md',
      }}
    >
      <Flex
        css={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Title>Epoch {e.number}</Title>
        {RenderEpochStatus(e)}
      </Flex>
      <Subtitle>{renderEpochDuration(e)}</Subtitle>
      {RenderEpochDates(e)}
    </Flex>
  );
};

export const renderUserCard = (user: IUser, tokenName: string) => {
  return (
    <Flex
      css={{
        flexDirection: 'row',
        margin: '$md',
      }}
    >
      <Avatar path={user.profile?.avatar} name={user.name} small />
      <Box
        css={{
          display: 'grid',
          ml: '$md',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <Title
          css={{
            display: 'block',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          {user.name}
        </Title>
        <Flex
          css={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Subtitle>{shortenAddress(user.address)}</Subtitle>
          <LightText>
            {user.role === USER_ROLE_ADMIN ? (
              'Admin'
            ) : (
              <>
                <Box css={{ mr: '$xs' }}>
                  {!user.non_giver ? (
                    <CheckIcon size="inherit" color="complete" />
                  ) : (
                    <CloseIcon size="inherit" color="alert" />
                  )}
                </Box>
                {tokenName}
              </>
            )}
          </LightText>
        </Flex>
      </Box>
    </Flex>
  );
};

export const TableLink = styled(RouterLink, {
  color: '$link',
  '&:hover': {
    opacity: 0.8,
  },
  textDecoration: 'none',
});

const coordinapeTooltipContent = () => {
  return (
    <Box
      css={{
        m: '$sm',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Text size="large" css={{ my: '$md' }}>
        Why is Coordinape in your circle?
      </Text>
      <p>
        We&apos;re experimenting with the gift circle mechanism as our revenue
        model. By default, Coordinape appears in your circle and any user can
        allocate to Coordinape. To remove the Coordinape user, click the trash
        can icon on the right side of this row.
      </p>
      <a
        href="https://coordinape.notion.site/Why-is-Coordinape-in-my-Circle-fd17133a82ef4cbf84d4738311fb557a"
        target="_blank"
        rel="noreferrer"
      >
        Let us know what you think
      </a>
    </Box>
  );
};

const renderCoordinapeActions = (enabled: boolean, onClick: () => void) => {
  return (
    <Flex css={{ justifyContent: 'center' }}>
      <Tooltip content={coordinapeTooltipContent()}>
        <Button
          size="small"
          onClick={onClick}
          color="textOnly"
          css={{ opacity: 1 }}
        >
          {enabled ? 'Disable' : 'Enable'}
        </Button>
      </Tooltip>
    </Flex>
  );
};

const renderActions = (onEdit?: () => void, onDelete?: () => void) => (
  <Flex css={{ justifyContent: 'center' }}>
    {onEdit && (
      <Button size="small" onClick={onEdit} color="textOnly">
        Edit
      </Button>
    )}
    {onEdit && onDelete && (
      <Text css={{ color: '$text', opacity: 1, position: 'relative' }}>|</Text>
    )}
    {onDelete && (
      <>
        <Button size="small" onClick={onDelete} color="textOnly">
          Delete
        </Button>
      </>
    )}
  </Flex>
);

const EmptyTable = ({
  content,
  onClick,
}: {
  content: string;
  onClick: () => void;
}) => {
  return (
    <Flex
      css={{
        height: 238,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        css={{
          fontSize: '$7',
          my: '$lg',
          fontWeight: '$bold',
          opacity: 0.7,
        }}
      >
        {content}
      </Text>
      <Button color="secondary" onClick={() => onClick()}>
        <PlusCircleIcon />
        Add Contributor
      </Button>
    </Flex>
  );
};

export const EpochsTable = ({
  circle,
  epochs,
  perPage = 6,
  downloadCSV,
  setEditEpoch,
  setDeleteEpochDialog,
  setNewEpoch,
}: {
  circle: ICircle;
  epochs: IEpoch[];
  perPage?: number;
  downloadCSV: (epoch: number) => Promise<any>;
  setEditEpoch: (e: IEpoch) => void;
  setDeleteEpochDialog: (e: IEpoch) => void;
  setNewEpoch: (newEpoch: boolean) => void;
}) => {
  const { isMobile } = useMobileDetect();

  const [page, setPage] = useState<number>(1);
  const [view, setView] = useState<IEpoch[]>([]);

  useEffect(() => {
    setView(epochs);
  }, [perPage, epochs]);

  const pagedView = useMemo(
    () =>
      view.slice((page - 1) * perPage, Math.min(page * perPage, view.length)),
    [view, perPage, page]
  );

  const TwoLineCell = styled('div', {
    height: 48,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    fontSize: 11,
    lineHeight: 1.5,
    '@xs': {
      height: 'auto',
    },
  });

  const CellTitle = styled('span', {
    fontWeight: '$semibold',
  });

  const CellSubtitle = styled('span', {
    fontWeight: '$normal',
  });

  const downloadCSVButton = (epoch: number, downloadLink: string) => (
    <TableLink
      to=""
      onClick={async () => {
        // use the authed api to download the CSV
        const csv = await downloadCSV(epoch);

        if (csv?.file) {
          const a = document.createElement('a');
          a.download = downloadLink;
          a.href = csv.file;
          a.click();
          a.href = '';
        }

        return false;
      }}
    >
      Export CSV
    </TableLink>
  );

  const epochDetail = (e: IEpoch) => {
    const r =
      e.repeatEnum === 'none'
        ? ''
        : e.repeatEnum === 'weekly'
        ? `${e.startDay} - ${e.endDay}`
        : 'monthly';
    return e.ended
      ? e.labelActivity
      : `${e.calculatedDays.toFixed()} ${
          e.calculatedDays > 1 ? 'days' : 'day'
        }${e.repeat ? ` repeats ${r}` : ''}`;
  };

  // Epoch Columns
  const RenderEpochDetails = (e: IEpoch) => (
    <TwoLineCell>
      <CellTitle>Epoch {e.number}</CellTitle>
      <CellSubtitle>{epochDetail(e)}</CellSubtitle>
    </TwoLineCell>
  );

  const RenderEpochDates = (e: IEpoch) => (
    <TwoLineCell>
      <CellTitle>
        {e.labelYearEnd} - {e.labelDayRange}
      </CellTitle>
      <CellSubtitle>{e.ended ? e.labelTimeEnd : e.labelTimeStart}</CellSubtitle>
    </TwoLineCell>
  );

  const RenderEpochActions = (e: IEpoch, downloadLink: string) => {
    if (e.ended) {
      // this epoch is over, so there are no edit/delete actions, only download CSV
      // assert that e.number is non-null
      if (e.number) {
        return (
          <Box css={{ display: 'flex', flexDirection: 'column' }}>
            {downloadCSVButton(e.number, downloadLink)}
            {isFeatureEnabled('vaults') && (
              <TableLink to={paths.distributions(circle.id, e.id)}>
                Distributions
              </TableLink>
            )}
          </Box>
        );
      } else {
        // epoch/number is null, so we can't provide a download link
        return <></>;
      }
    } else {
      // epoch still in progress
      return renderActions(
        () => setEditEpoch(e),
        !e.started ? () => setDeleteEpochDialog(e) : undefined
      );
    }
  };

  return (
    <Table.Table>
      <Table.Root>
        {!isMobile && (
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell align="left">Epoch Details</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell align="left">Dates</Table.HeaderCell>
              <Table.HeaderCell area="narrow">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
        )}
        <Table.Body>
          {epochs.length ? (
            isMobile ? (
              pagedView.map(e => {
                return (
                  <Table.Row key={e.id}>
                    <td>{renderEpochCard(e)}</td>
                  </Table.Row>
                );
              })
            ) : (
              pagedView.map(e => {
                return (
                  <Table.Row key={e.id}>
                    <Table.Cell key={`details-${e.id}`} align="left">
                      {RenderEpochDetails(e)}
                    </Table.Cell>

                    <Table.Cell key={`status-${e.id}`}>
                      {RenderEpochStatus(e)}
                    </Table.Cell>

                    <Table.Cell key={`date-${e.id}`} align="left">
                      {RenderEpochDates(e)}
                    </Table.Cell>

                    <Table.Cell key={`actions-${e.id}`}>
                      {RenderEpochActions(
                        e,
                        `${circle?.protocol.name}-${circle?.name}-epoch-${e}.csv`
                      )}
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )
          ) : (
            <Table.Row>
              <Table.Cell key={`empty-epochs-table-view`} colSpan={4}>
                <EmptyTable
                  content="You don’t have any epochs scheduled"
                  onClick={() => setNewEpoch(true)}
                />
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
      <Paginator
        totalItems={epochs.length}
        currentPage={page}
        onPageChange={setPage}
        itemsPerPage={perPage}
      />
    </Table.Table>
  );
};

const defaultSort = <T,>(a: T, b: T) => (a > b ? 1 : a < b ? -1 : 0);

type TableSorting = {
  field: keyof IUser;
  ascending: 1 | -1;
  sort?: <T>(a: T, b: T) => number;
};

const englishCollator = new Intl.Collator('en-u-kf-upper');

const makeCoordinape = (circleId: number): IUser => {
  return {
    circle_id: circleId,
    created_at: new Date().toString(),
    epoch_first_visit: false,
    give_token_received: 0,
    id: -1,
    isCircleAdmin: false,
    isCoordinapeUser: true,
    deleted_at: new Date().toString(),
    teammates: [],
    updated_at: '',
    name: 'Coordinape',
    address: USER_COORDINAPE_ADDRESS,
    role: 2,
    non_receiver: false,
    fixed_non_receiver: false,
    starting_tokens: 0,
    non_giver: true,
    give_token_remaining: 0,
    bio: 'Coordinape is the platform you’re using right now! We currently offer our service for free and invite people to allocate to us from within your circles. All funds received go towards funding the team and our operations.',
  };
};

export const MembersTable = ({
  visibleUsers,
  myUser: me,
  circle,
  setNewUser,
  setEditUser,
  setDeleteUserDialog,
  filter,
  perPage = 6,
}: {
  visibleUsers: IUser[];
  myUser: IUser;
  circle: ICircle;
  setNewUser: (newUser: boolean) => void;
  setEditUser: (u: IUser) => void;
  setDeleteUserDialog: (u: IUser) => void;
  filter: (u: IUser) => boolean;
  perPage?: number;
}) => {
  const { restoreCoordinape, deleteUser } = useApiAdminCircle(circle.id);
  const { isMobile } = useMobileDetect();
  const [page, setPage] = useState<number>(1);
  const [view, setView] = useState<IUser[]>([]);
  const [order, setOrder] = useState<TableSorting>({
    field: 'name',
    ascending: 1,
  });

  const updateOrder = (
    field: keyof IUser,
    sort?: (a: any, b: any) => number
  ) => {
    setOrder({
      field: field,
      sort: sort,
      ascending: order.field === field ? (order.ascending === 1 ? -1 : 1) : 1,
    });
  };

  const { getToProfile } = useNavigation();

  const coordinapeUser = useMemo(() => makeCoordinape(circle.id), [circle]);

  const users: IUser[] = useMemo(() => {
    if (
      !visibleUsers.some(u => u.address === coordinapeUser.address) &&
      visibleUsers.length > 0
    ) {
      return [...visibleUsers, coordinapeUser];
    }
    return visibleUsers;
  }, [circle, visibleUsers, coordinapeUser]);

  useEffect(() => {
    const sortItem = order.sort ?? defaultSort;
    const sorter = (a: IUser, b: IUser) => {
      return order.ascending * sortItem(a[order.field], b[order.field]);
    };

    const filtered = filter ? users.filter(filter) : users;
    setView(filtered.sort(sorter));
  }, [users, perPage, filter, order]);

  const pagedView = useMemo(
    () =>
      view.slice((page - 1) * perPage, Math.min(page * perPage, view.length)),
    [view, perPage, page]
  );

  const UserName = ({ user }: { user: IUser }) => {
    return (
      <Box
        css={{
          height: 48,
          alignItems: 'center',

          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          width: '100%',
        }}
      >
        <Avatar
          path={user?.profile?.avatar}
          name={user?.name}
          small
          onClick={getToProfile(user.address)}
        />
        <Text
          css={{
            display: 'block',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          {user.name}
        </Text>
        <span>
          {user.role === USER_ROLE_COORDINAPE ? (
            <Box css={{ marginTop: '6px' }}>
              <Tooltip content={coordinapeTooltipContent()}>
                <InfoCircledIcon />
              </Tooltip>
            </Box>
          ) : (
            ''
          )}
        </span>
      </Box>
    );
  };

  const renderTooltip = (content: React.ReactNode) => {
    return (
      <Tooltip content={content}>
        <InfoCircledIcon />
      </Tooltip>
    );
  };

  const renderLabel = (
    label: string,
    order: TableSorting,
    fieldName: keyof IUser
  ): string =>
    `${label} ${
      order.field === fieldName ? (order.ascending > 0 ? ' ↑' : ' ↓') : ''
    } `;

  return (
    <Table.Table>
      <Table.Root>
        {!isMobile && (
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                align="left"
                clickable
                onClick={() =>
                  updateOrder('name', (a: string, b: string) => {
                    return englishCollator.compare(a, b);
                  })
                }
              >
                {renderLabel('Name', order, 'name')}
              </Table.HeaderCell>
              <Table.HeaderCell
                clickable
                onClick={() =>
                  updateOrder('address', (a: string, b: string) => {
                    return englishCollator.compare(a, b);
                  })
                }
              >
                {renderLabel('ETH Wallet', order, 'address')}
              </Table.HeaderCell>
              <Table.HeaderCell
                clickable
                onClick={() => updateOrder('non_giver')}
              >
                {renderLabel(
                  `Can give ${circle.tokenName}`,
                  order,
                  'non_giver'
                )}
                {renderTooltip(
                  <>{`Circle Member allocating ${circle.tokenName}`}</>
                )}
              </Table.HeaderCell>
              <Table.HeaderCell
                clickable
                onClick={() => updateOrder('fixed_non_receiver')}
              >
                {renderLabel(
                  `Can receive ${circle.tokenName}`,
                  order,
                  'fixed_non_receiver'
                )}
                {renderTooltip(
                  <>{`Circle Member receiving ${circle.tokenName}`}</>
                )}
              </Table.HeaderCell>
              <Table.HeaderCell clickable onClick={() => updateOrder('role')}>
                {renderLabel('Admin', order, 'role')}
                {renderTooltip(
                  <>
                    As a Circle Admin, you will be able to edit Circle Settings,
                    Edit Epoch settings, edit your users, and create new
                    circles.{' '}
                    <Link
                      href="https://docs.coordinape.com/get-started/admin"
                      target="_blank"
                    >
                      Learn More
                    </Link>
                  </>
                )}
              </Table.HeaderCell>
              <Table.HeaderCell
                clickable
                onClick={() => updateOrder('give_token_remaining')}
              >
                {renderLabel(
                  `${circle.tokenName} sent`,
                  order,
                  'fixed_non_receiver'
                )}
              </Table.HeaderCell>
              <Table.HeaderCell
                clickable
                onClick={() => updateOrder('give_token_received')}
              >
                {renderLabel(
                  `${circle.tokenName} received`,
                  order,
                  'give_token_received'
                )}
              </Table.HeaderCell>
              {isFeatureEnabled('fixed_payments') && (
                <Table.HeaderCell
                  clickable
                  onClick={() => updateOrder('fixed_payment_amount')}
                >
                  {renderLabel(
                    `Fixed Payment Amount ${
                      circle.fixed_payment_token_type ?? '(Disabled)'
                    }`,
                    order,
                    'fixed_payment_amount'
                  )}
                </Table.HeaderCell>
              )}
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
        )}
        <Table.Body>
          {users.length ? (
            isMobile ? (
              pagedView.map(u => {
                return (
                  <Table.Row key={u.id}>
                    <td>{renderUserCard(u, circle.tokenName)}</td>
                  </Table.Row>
                );
              })
            ) : (
              pagedView.map(u => {
                return (
                  <Table.Row key={u.id}>
                    <Table.Cell
                      key={`user-name-${u.id}`}
                      area="wide"
                      align="left"
                      disabled={u.deleted_at !== null}
                    >
                      <UserName user={u} />
                    </Table.Cell>

                    <Table.Cell
                      key={`address-${u.id}`}
                      disabled={u.deleted_at !== null}
                    >
                      {shortenAddress(u.address)}
                    </Table.Cell>

                    <Table.Cell
                      key={`giver-${u.id}`}
                      disabled={u.deleted_at !== null}
                    >
                      {!u.non_giver ? (
                        <CheckIcon size="inherit" color="complete" />
                      ) : (
                        <CloseIcon size="inherit" color="alert" />
                      )}
                    </Table.Cell>

                    <Table.Cell
                      key={`recipient-${u.id}`}
                      disabled={u.deleted_at !== null}
                    >
                      {u.fixed_non_receiver ? (
                        'Forced ❌'
                      ) : u.non_receiver ? (
                        <CloseIcon size="inherit" color="alert" />
                      ) : (
                        <CheckIcon size="inherit" color="complete" />
                      )}
                    </Table.Cell>

                    <Table.Cell
                      key={`admin-${u.id}`}
                      disabled={u.deleted_at !== null}
                    >
                      {u.role === USER_ROLE_ADMIN ? (
                        <CheckIcon size="inherit" color="complete" />
                      ) : (
                        <CloseIcon size="inherit" color="alert" />
                      )}
                    </Table.Cell>
                    <Table.Cell
                      key={`give-sent-${u.id}`}
                      disabled={u.deleted_at !== null}
                    >
                      {!u.non_giver ||
                      u.starting_tokens - u.give_token_remaining != 0
                        ? `${u.starting_tokens - u.give_token_remaining}/${
                            u.starting_tokens
                          }`
                        : '-'}
                    </Table.Cell>
                    <Table.Cell
                      key={`give-received-${u.id}`}
                      disabled={u.deleted_at !== null}
                    >
                      {u.give_token_received === 0 &&
                      (!!u.fixed_non_receiver || !!u.non_receiver)
                        ? '-'
                        : u.give_token_received}
                    </Table.Cell>
                    {isFeatureEnabled('fixed_payments') && (
                      <Table.Cell key={`fixed-amount-${u.id}`}>
                        {u.fixed_payment_amount === 0
                          ? '-'
                          : u.fixed_payment_amount}
                      </Table.Cell>
                    )}
                    <Table.Cell key={`actions-${u.id}`}>
                      {u.role === USER_ROLE_COORDINAPE
                        ? renderCoordinapeActions(u.deleted_at === null, () => {
                            const shouldEnable = u.deleted_at !== null;
                            const confirm = window.confirm(
                              `${
                                shouldEnable ? 'Enable' : 'Disable'
                              } Coordinape in this circle?`
                            );
                            if (confirm) {
                              shouldEnable
                                ? restoreCoordinape(circle.id).catch(e =>
                                    console.error(e)
                                  )
                                : deleteUser(u.address);
                            }
                          })
                        : renderActions(
                            () => setEditUser(u),
                            u.id !== me?.id
                              ? () => setDeleteUserDialog(u)
                              : undefined
                          )}
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )
          ) : (
            <Table.Row>
              <Table.Cell key={`empty-users-table-view`} colSpan={4}>
                <EmptyTable
                  content="You haven’t added any contributors"
                  onClick={() => setNewUser(true)}
                />
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
      <Paginator
        totalItems={users.length}
        currentPage={page}
        onPageChange={setPage}
        itemsPerPage={perPage}
      />
    </Table.Table>
  );
};
