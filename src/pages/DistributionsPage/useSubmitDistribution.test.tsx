import assert from 'assert';
import { useEffect } from 'react';

import { act, render, waitFor } from '@testing-library/react';
import { BigNumber } from 'ethers';
import { createDistribution } from 'lib/merkle-distributor';
import { getWrappedAmount, Asset } from 'lib/vaults';

import { useContracts } from 'hooks';
import { useDistributor } from 'hooks/useDistributor';
import { useVaultFactory } from 'hooks/useVaultFactory';
import { useVaultRouter } from 'hooks/useVaultRouter';
import {
  provider,
  restoreSnapshot,
  takeSnapshot,
  TestWrapper,
} from 'utils/testing';
import { mint } from 'utils/testing/mint';

import { useSubmitDistribution } from './useSubmitDistribution';

let snapshotId: string;

jest.mock('lib/gql/mutations', () => {
  return {
    addVault: jest
      .fn()
      .mockImplementationOnce(x =>
        Promise.resolve({
          createVault: {
            vault: {
              ...x,
              token_address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
              decimals: 18,
              symbol: 'DAI',
              org_id: 101,
            },
          },
        })
      )
      .mockImplementationOnce(x =>
        Promise.resolve({
          createVault: {
            vault: {
              ...x,
              token_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
              decimals: 6,
              symbol: 'USDC',
              org_id: 101,
            },
          },
        })
      ),
  };
});

jest.mock('pages/DistributionsPage/mutations', () => {
  return {
    useSaveEpochDistribution: jest.fn().mockReturnValue({
      mutateAsync: jest.fn().mockReturnValue({
        id: 2,
      }),
    }),
    useMarkDistributionSaved: jest.fn().mockReturnValue({
      mutateAsync: jest.fn().mockReturnValue({
        id: 2,
      }),
    }),
  };
});

beforeAll(async () => {
  snapshotId = await takeSnapshot();
  const mainAccount = (await provider.listAccounts())[0];
  await mint({
    token: Asset.DAI,
    address: mainAccount,
    amount: '1000',
  });
  await mint({
    token: Asset.USDC,
    address: mainAccount,
    amount: '1000',
  });
});

afterAll(async () => {
  await restoreSnapshot(snapshotId);
});

test('submit distribution', async () => {
  let work: Promise<boolean> | null = null;
  let merkleRootFromSubmission = 'expected';
  let merkleRootFromDistributor = 'actual';

  const Harness = () => {
    const { createVault } = useVaultFactory(101); // fake org id
    const submitDistribution = useSubmitDistribution();

    const contracts = useContracts();
    const { deposit } = useVaultRouter(contracts);
    const { getEpochRoot } = useDistributor();

    useEffect(() => {
      if (!contracts) return;

      work = (async () => {
        const vault = await createVault({
          simpleTokenAddress: '0x0',
          type: Asset.DAI,
        });
        assert(vault, 'vault not created');

        await deposit(vault, '100');

        const distro = await submitDistribution({
          amount: '100',
          vault,
          circleId: 2,
          userIdsByAddress,
          epochId: 2,
          gifts,
        });
        merkleRootFromSubmission = distro.merkleRoot;

        merkleRootFromDistributor = await getEpochRoot(
          vault.vault_address,
          distro.encodedCircleId,
          await contracts.getVault(vault.vault_address).vault(),
          distro.epochId
        );
        return true;
      })();
    }, [contracts]);

    return null;
  };

  await act(async () => {
    render(
      <TestWrapper withWeb3>
        <Harness />
      </TestWrapper>
    );
    await waitFor(() => expect(work).toBeTruthy());
    await expect(work).resolves.toBeTruthy();
  });

  expect(merkleRootFromDistributor).toEqual(merkleRootFromSubmission);
}, 20000);

test('previous distribution', async () => {
  let work: Promise<boolean> | null = null;
  let previousTotal = BigNumber.from(0);
  let newTotal = BigNumber.from(0);
  let expectedTotal = BigNumber.from(0);

  const Harness = () => {
    const { createVault } = useVaultFactory(101); // fake org id
    const submitDistribution = useSubmitDistribution();

    const contracts = useContracts();
    const { deposit } = useVaultRouter(contracts);

    useEffect(() => {
      if (!contracts) return;

      work = (async () => {
        const vault = await createVault({
          simpleTokenAddress: '0x0',
          type: Asset.USDC,
        });
        assert(vault, 'vault not created');
        await deposit(vault, '120');

        previousTotal = await getWrappedAmount('100', vault, contracts);
        expectedTotal = previousTotal.mul(2);

        const previousDistribution = createDistribution(
          previousGifts,
          previousTotal
        );

        const distro = await submitDistribution({
          amount: '100',
          vault,
          circleId: 2,
          userIdsByAddress,
          epochId: 2,
          gifts,
          previousDistribution: {
            id: 1,
            vault_id: 1,
            distribution_json: JSON.stringify(previousDistribution),
            tx_hash: '0x0',
          },
        });

        newTotal = distro.totalAmount;
        return true;
      })();
    }, [contracts]);

    return null;
  };

  await act(async () => {
    render(
      <TestWrapper withWeb3>
        <Harness />
      </TestWrapper>
    );
    await waitFor(() => expect(work).toBeTruthy());
    await expect(work).resolves.toBeTruthy();
  });

  expect(expectedTotal.toString()).toEqual(newTotal.toString());
}, 20000);

const userIdsByAddress = {
  '0xabc0000000000000000000000000000000000001': 15,
  '0xabc0000000000000000000000000000000000002': 13,
  '0xabc0000000000000000000000000000000000003': 14,
};

const gifts = {
  '0xabc0000000000000000000000000000000000001': 20,
  '0xabc0000000000000000000000000000000000002': 30,
  '0xabc0000000000000000000000000000000000003': 40,
};

const previousGifts = {
  '0xabc0000000000000000000000000000000000001': 10,
  '0xabc0000000000000000000000000000000000002': 20,
  '0xabc0000000000000000000000000000000000003': 30,
};
