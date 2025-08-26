import Button from './Button';
import { z } from 'zod';
import { usePersistentForm } from '@/hooks/usePersistentForm';
import { useRaceStore } from '@/store/useRaceStore';
import { type FC } from 'react';

const formSchema = z.object({
  text: z.string()
    .min(1, "Brand is required")
    .max(30, "Brand must be less than 30 characters")
    .trim(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  selectedId: z.number()
    .nullable()
});

type FormData = z.infer<typeof formSchema>;

// Base Input Component
const BaseCarInput: FC<{
  buttonText: string;
  storageKey: string;
  onSubmit: (data: FormData) => void;
  isSubmitDisabled: (data: FormData, isValid: boolean) => boolean;
  shouldClearAfterSubmit?: boolean;
}> = ({ 
  buttonText, 
  storageKey, 
  onSubmit, 
  isSubmitDisabled, 
  shouldClearAfterSubmit = true
}) => {
    const { data, setData, errors, isValid, clearData } = usePersistentForm<FormData>(
        formSchema, 
        { text: '', color: '#000000', selectedId: null }, 
        storageKey
    );

    const handleInputChange = (field: keyof FormData, value: string | number | null) => {
        setData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        if (!isSubmitDisabled(data, isValid)) {
            onSubmit(data);
            if (shouldClearAfterSubmit) {
                clearData();
            }
        }
    };

    return (
        <div className="flex items-center gap-1 flex-row">
            <input 
                type="text"
                placeholder="Car Brand"
                value={data.text}
                className={`w-32 px-2 py-1 bg-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 ${
                    errors.text ? 'border-red-500' : 'border-gray-300'
                }`}
                onChange={(e) => handleInputChange('text', e.target.value)}
            />
            <input
                type="color"
                value={data.color}
                className={`w-7 h-7 bg-gray-400 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.color ? 'border-red-500' : 'border-gray-300'
                }`}  
                onChange={(e) => handleInputChange('color', e.target.value)}          
            />
            <Button 
                size="sm" 
                onClick={handleSubmit} 
                disabled={isSubmitDisabled(data, isValid)}
            >
                <span>{buttonText}</span>
            </Button>
        </div>
    );
};

const CreateInput: FC = () => {
    const createCar = useRaceStore((state) => state.createCar);

    const handleCreate = (data: FormData) => {
        createCar(data.text, data.color);
    };

    const isCreateDisabled = (data: FormData, isValid: boolean) => {
        return !isValid;
    };

    return (
        <BaseCarInput
            buttonText="Create"
            storageKey="createInputStorage"
            onSubmit={handleCreate}
            isSubmitDisabled={isCreateDisabled}
            shouldClearAfterSubmit={true}
        />
    );
};

const UpdateInput: FC = () => {
    const updateCar = useRaceStore((state) => state.updateCar);

    const handleUpdate = (data: FormData) => {
        if (data.selectedId !== null) {
            updateCar(data.selectedId, data.text, data.color);
        }
    };

    const isUpdateDisabled = (data: FormData, isValid: boolean) => {
        return !isValid || data.selectedId === null;
    };

    return (
        <BaseCarInput
            buttonText="Update"
            storageKey="updateInputStorage"
            onSubmit={handleUpdate}
            isSubmitDisabled={isUpdateDisabled}
            shouldClearAfterSubmit={false}
        />
    );
};

const DataInput: FC<{ action: 'create' | 'update' }> = ({ action }) => {
    if (action === 'create') {
        return <CreateInput />;
    }
    
    return <UpdateInput />;
};

export default DataInput;
export { CreateInput, UpdateInput };