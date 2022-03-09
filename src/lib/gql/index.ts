import { Thunder, apiFetch, ValueTypes, $ } from './zeusUser';

const makeQuery = (url: string, getToken: () => string) =>
  Thunder(
    apiFetch([
      url,
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + getToken(),
        },
      },
    ])
  );

export function getGql(url: string, getToken: () => string) {
  const updateProfile = async (
    id: number,
    profile: ValueTypes['profiles_set_input']
  ) =>
    makeQuery(url, getToken)('mutation')({
      update_profiles_by_pk: [
        { set: profile, pk_columns: { id } },
        { id: true, admin_view: true },
      ],
    });

  const updateProfileAvatar = async (image_data_base64: string) =>
    makeQuery(url, getToken)('mutation')(
      {
        uploadProfileAvatar: [
          { payload: { image_data_base64: $`image_data_base64` } },
          { id: true },
        ],
      },
      {
        variables: {
          image_data_base64,
        },
      }
    );

  const getCurrentEpoch = async (
    circle_id: number
  ): Promise<typeof currentEpoch | undefined> => {
    const {
      epochs: [currentEpoch],
    } = await makeQuery(url, getToken)('query')({
      epochs: [
        {
          where: {
            circle_id: { _eq: circle_id },
            end_date: { _gt: 'now()' },
            start_date: { _lt: 'now()' },
          },
        },
        { id: true },
      ],
    });
    return currentEpoch;
  };

  const updateProfileBackground = async (image_data_base64: string) =>
    makeQuery(url, getToken)('mutation')(
      {
        uploadProfileBackground: [
          { payload: { image_data_base64: $`image_data_base64` } },
          { id: true },
        ],
      },
      {
        variables: {
          image_data_base64,
        },
      }
    );

  const updateCircleLogo = async (
    circleId: number,
    image_data_base64: string
  ) =>
    makeQuery(url, getToken)('mutation')(
      {
        uploadCircleLogo: [
          {
            payload: {
              image_data_base64: $`image_data_base64`,
              circle_id: $`circleId`,
            },
          },
          { id: true },
        ],
      },
      {
        variables: {
          circleId: circleId,
          image_data_base64,
        },
      }
    );

  const getUserFromProfileIdWithCircle = async (
    profileId: number,
    circleId: number
  ) => {
    const { profiles_by_pk } = await makeQuery(url, getToken)('query')({
      profiles_by_pk: [
        {
          id: profileId,
        },
        {
          users: [
            {
              where: {
                circle_id: { _eq: circleId },
              },
            },
            {
              circle: {
                nomination_days_limit: true,
                min_vouches: true,
              },
              id: true,
            },
          ],
        },
      ],
    });
    return profiles_by_pk;
  };

  return {
    updateProfile,
    getCurrentEpoch,
    updateProfileAvatar,
    updateProfileBackground,
    updateCircleLogo,
    getUserFromProfileIdWithCircle,
  };
}

/*
example usage in app code:

import { REACT_APP_HASURA_URL } from 'config/env';
import { getAuthToken } from 'services/api';
import { getGql } from 'lib/gql';

// TODO: this doesnt actually work cuz getAuthToken is an optional
// callers need to unwrap the optional and pass in to this

const api = getGql(REACT_APP_HASURA_URL, getAuthToken);
await api.updateProfile();
*/
