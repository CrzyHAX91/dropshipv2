import React from 'react';
import PropTypes from 'prop-types';

const FormField = ({
    label,
    name,
    type = 'text',
    register,
    error,
    className = '',
    required = false,
    disabled = false,
    placeholder = '',
    options = [],
    ...props
}) => {
    const baseInputClasses = `
        input w-full
        ${error ? 'input-error' : 'input-bordered'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
    `;

    const renderField = () => {
        switch (type) {
            case 'select':
                return (
                    <select
                        {...register(name)}
                        className={`select ${baseInputClasses} ${className}`}
                        disabled={disabled}
                        {...props}
                    >
                        {options.map((option) => (
                            <option 
                                key={option.value} 
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'textarea':
                return (
                    <textarea
                        {...register(name)}
                        className={`textarea ${baseInputClasses} ${className}`}
                        placeholder={placeholder}
                        disabled={disabled}
                        {...props}
                    />
                );

            case 'checkbox':
                return (
                    <input
                        type="checkbox"
                        {...register(name)}
                        className={`checkbox ${error ? 'checkbox-error' : ''} ${className}`}
                        disabled={disabled}
                        {...props}
                    />
                );

            case 'radio':
                return options.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2">
                        <input
                            type="radio"
                            {...register(name)}
                            value={option.value}
                            className={`radio ${error ? 'radio-error' : ''} ${className}`}
                            disabled={disabled}
                            {...props}
                        />
                        <span>{option.label}</span>
                    </label>
                ));

            case 'file':
                return (
                    <input
                        type="file"
                        {...register(name)}
                        className={`file-input ${baseInputClasses} ${className}`}
                        disabled={disabled}
                        {...props}
                    />
                );

            case 'date':
            case 'time':
            case 'datetime-local':
                return (
                    <input
                        type={type}
                        {...register(name)}
                        className={`${baseInputClasses} ${className}`}
                        disabled={disabled}
                        {...props}
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        {...register(name)}
                        className={`${baseInputClasses} ${className}`}
                        placeholder={placeholder}
                        disabled={disabled}
                        step={props.step || 'any'}
                        {...props}
                    />
                );

            case 'password':
                return (
                    <div className="relative">
                        <input
                            type="password"
                            {...register(name)}
                            className={`${baseInputClasses} ${className}`}
                            placeholder={placeholder}
                            disabled={disabled}
                            {...props}
                        />
                        {props.showPasswordToggle && (
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                onClick={props.onTogglePassword}
                            >
                                <i className={`fas fa-eye${props.showPassword ? '-slash' : ''}`} />
                            </button>
                        )}
                    </div>
                );

            default:
                return (
                    <input
                        type={type}
                        {...register(name)}
                        className={`${baseInputClasses} ${className}`}
                        placeholder={placeholder}
                        disabled={disabled}
                        {...props}
                    />
                );
        }
    };

    return (
        <div className="form-control w-full">
            {label && (
                <label className="label">
                    <span className="label-text">
                        {label}
                        {required && <span className="text-error ml-1">*</span>}
                    </span>
                </label>
            )}
            {renderField()}
            {error && (
                <label className="label">
                    <span className="label-text-alt text-error">{error.message}</span>
                </label>
            )}
            {props.hint && (
                <label className="label">
                    <span className="label-text-alt text-gray-500">{props.hint}</span>
                </label>
            )}
        </div>
    );
};

FormField.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf([
        'text',
        'email',
        'password',
        'number',
        'tel',
        'url',
        'date',
        'time',
        'datetime-local',
        'select',
        'textarea',
        'checkbox',
        'radio',
        'file'
    ]),
    register: PropTypes.func.isRequired,
    error: PropTypes.object,
    className: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]).isRequired,
            label: PropTypes.string.isRequired
        })
    ),
    hint: PropTypes.string,
    showPasswordToggle: PropTypes.bool,
    showPassword: PropTypes.bool,
    onTogglePassword: PropTypes.func,
    step: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ])
};

export default FormField;
