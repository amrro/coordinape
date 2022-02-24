import { useNavigate } from 'react-router-dom';

import { FormModal } from 'components';
import { AllocateFundsCard } from 'components/AllocateFundsCard/AllocateFundsCard';
import AdminVaultForm from 'forms/AdminVaultForm';
import { PlusCircleIcon } from 'icons';

import { IEpoch } from 'types';

interface AllocateModalProps {
  epoch: IEpoch;
  onClose: () => void;
}

export default function AllocateModal({ epoch, onClose }: AllocateModalProps) {
  // const classes = useStyles();
  const navigate = useNavigate();
  // const [ongoing, setOngoing] = useState<boolean>(false);

  // const setOngoingAllocation = () => {
  //   setOngoing(!ongoing);
  // };

  //   TODO: Pull in real data to populate FormTextField label and update value
  /**
   * TODO:
   * get fundsAvailable from real data
   */
  return (
    <AdminVaultForm.FormController
      source={undefined}
      hideFieldErrors
      submit={params => {
        console.warn('todo:', params);
        const path = '/admin/vaults';
        navigate(path);
      }}
    >
      {({ fields, handleSubmit, changedOutput }) => (
        <FormModal
          onClose={onClose}
          onSubmit={handleSubmit}
          submitDisabled={!changedOutput}
          size="small"
          icon={<PlusCircleIcon />}
          submitText={`Commit Budget`}
        >
          <AllocateFundsCard
            css={{
              py: '$2xl',
            }}
            epoch={epoch}
            onChange={fields.token.onChange}
            fundsAvailable={20000}
            recurringLabel="monthly"
          ></AllocateFundsCard>
        </FormModal>
      )}
    </AdminVaultForm.FormController>
  );
}
