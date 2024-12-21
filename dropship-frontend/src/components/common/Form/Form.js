import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingSpinner from '../LoadingSpinner';

const Form = ({
    onSubmit,
    schema,
    children,
    defaultValues = {},
    className = '',
    loading = false,
    submitButton = 'Submit',
    resetButton = false
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: schema ? yupResolver(schema) : undefined,
        defaultValues
    });

    const processSubmit = async (data) => {
        try {
            await onSubmit(data);
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    return (
        <form 
            onSubmit={handleSubmit(processSubmit)} 
            className={`space-y-6 ${className}`}
            noValidate
        >
            {/* Render form fields with register */}
            {typeof children === 'function' 
                ? children({ register, errors }) 
                : children
            }

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
                {resetButton && (
                    <button
                        type="button"
                        onClick={() => reset(defaultValues)}
                        className="btn btn-outline"
                        disabled={isSubmitting || loading}
                    >
                        Reset
                    </button>
                )}
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || loading}
                >
                    {(isSubmitting || loading) ? (
                        <LoadingSpinner size="sm" color="white" />
                    ) : submitButton}
                </button>
            </div>
        </form>
    );
};

Form.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    schema: PropTypes.object,
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func
    ]).isRequired,
    defaultValues: PropTypes.object,
    className: PropTypes.string,
    loading: PropTypes.bool,
    submitButton: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node
    ]),
    resetButton: PropTypes.bool
};

export default Form;
