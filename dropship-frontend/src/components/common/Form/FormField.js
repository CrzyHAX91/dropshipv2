import React from 'react';
import { useField } from 'formik';
import { makeStyles } from '@material-ui/core/styles';
import {
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(2),
    minWidth: 120,
  },
  select: {
    minWidth: 120,
  },
  helperText: {
    marginLeft: 0,
  },
}));

function FormField({
  label,
  type = 'text',
  options = [],
  fullWidth = false,
  helperText,
  ...props
}) {
  const classes = useStyles();
  const [field, meta, helpers] = useField(props);
  const hasError = meta.touched && meta.error;
  const errorMessage = hasError ? meta.error : '';

  const commonProps = {
    ...field,
    error: hasError,
    helperText: errorMessage || helperText,
    fullWidth,
    ...props,
  };

  switch (type) {
    case 'select':
      return (
        <FormControl
          error={hasError}
          className={classes.formControl}
          fullWidth={fullWidth}
        >
          <InputLabel>{label}</InputLabel>
          <Select
            {...field}
            className={classes.select}
            {...props}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(errorMessage || helperText) && (
            <FormHelperText className={classes.helperText}>
              {errorMessage || helperText}
            </FormHelperText>
          )}
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControl
          error={hasError}
          className={classes.formControl}
          fullWidth={fullWidth}
        >
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={field.value}
                {...props}
              />
            }
            label={label}
          />
          {(errorMessage || helperText) && (
            <FormHelperText className={classes.helperText}>
              {errorMessage || helperText}
            </FormHelperText>
          )}
        </FormControl>
      );

    case 'switch':
      return (
        <FormControl
          error={hasError}
          className={classes.formControl}
          fullWidth={fullWidth}
        >
          <FormControlLabel
            control={
              <Switch
                {...field}
                checked={field.value}
                {...props}
              />
            }
            label={label}
          />
          {(errorMessage || helperText) && (
            <FormHelperText className={classes.helperText}>
              {errorMessage || helperText}
            </FormHelperText>
          )}
        </FormControl>
      );

    case 'radio':
      return (
        <FormControl
          error={hasError}
          className={classes.formControl}
          fullWidth={fullWidth}
        >
          <FormLabel component="legend">{label}</FormLabel>
          <RadioGroup {...field} {...props}>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {(errorMessage || helperText) && (
            <FormHelperText className={classes.helperText}>
              {errorMessage || helperText}
            </FormHelperText>
          )}
        </FormControl>
      );

    case 'textarea':
      return (
        <TextField
          {...commonProps}
          label={label}
          multiline
          rows={4}
        />
      );

    default:
      return (
        <TextField
          {...commonProps}
          label={label}
          type={type}
        />
      );
  }
}

// Predefined field variants
FormField.Email = (props) => (
  <FormField
    type="email"
    label="Email"
    autoComplete="email"
    {...props}
  />
);

FormField.Password = (props) => (
  <FormField
    type="password"
    label="Password"
    autoComplete="current-password"
    {...props}
  />
);

FormField.Search = (props) => (
  <FormField
    type="search"
    label="Search"
    {...props}
  />
);

FormField.Phone = (props) => (
  <FormField
    type="tel"
    label="Phone"
    autoComplete="tel"
    {...props}
  />
);

FormField.Date = (props) => (
  <FormField
    type="date"
    label="Date"
    InputLabelProps={{ shrink: true }}
    {...props}
  />
);

FormField.Time = (props) => (
  <FormField
    type="time"
    label="Time"
    InputLabelProps={{ shrink: true }}
    {...props}
  />
);

export default FormField;
