import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Button, CircularProgress } from '@material-ui/core';
import { Formik, Form as FormikForm } from 'formik';

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.spacing(3),
  },
  actions: {
    marginTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'flex-end',
    '& > button': {
      marginLeft: theme.spacing(1),
    },
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
}));

function Form({
  initialValues,
  validationSchema,
  onSubmit,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  loading = false,
  disabled = false,
  showCancel = true,
  elevation = 1,
  className,
  submitButtonProps = {},
  cancelButtonProps = {},
}) {
  const classes = useStyles();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <Paper elevation={elevation} className={classes.form}>
          <FormikForm className={className}>
            {typeof children === 'function' ? children(formikProps) : children}
            
            <div className={classes.actions}>
              {showCancel && (
                <Button
                  onClick={onCancel}
                  disabled={loading || disabled}
                  {...cancelButtonProps}
                >
                  {cancelText}
                </Button>
              )}
              <div className={classes.wrapper}>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={loading || disabled || !formikProps.isValid || !formikProps.dirty}
                  {...submitButtonProps}
                >
                  {submitText}
                </Button>
                {loading && (
                  <CircularProgress size={24} className={classes.buttonProgress} />
                )}
              </div>
            </div>
          </FormikForm>
        </Paper>
      )}
    </Formik>
  );
}

// Form variants for common use cases
Form.Login = ({
  onSubmit,
  loading,
  initialValues = { email: '', password: '' },
  ...props
}) => (
  <Form
    initialValues={initialValues}
    validationSchema={loginValidationSchema}
    onSubmit={onSubmit}
    loading={loading}
    submitText="Login"
    showCancel={false}
    {...props}
  >
    <FormField
      name="email"
      label="Email"
      type="email"
      autoComplete="email"
      fullWidth
    />
    <FormField
      name="password"
      label="Password"
      type="password"
      autoComplete="current-password"
      fullWidth
    />
  </Form>
);

Form.Search = ({
  onSubmit,
  loading,
  initialValues = { query: '' },
  ...props
}) => (
  <Form
    initialValues={initialValues}
    onSubmit={onSubmit}
    loading={loading}
    submitText="Search"
    showCancel={false}
    {...props}
  >
    <FormField
      name="query"
      label="Search"
      fullWidth
      InputProps={{
        endAdornment: loading && (
          <CircularProgress color="inherit" size={20} />
        ),
      }}
    />
  </Form>
);

Form.Filter = ({
  onSubmit,
  loading,
  filters,
  initialValues = {},
  ...props
}) => (
  <Form
    initialValues={initialValues}
    onSubmit={onSubmit}
    loading={loading}
    submitText="Apply Filters"
    cancelText="Reset"
    {...props}
  >
    {filters}
  </Form>
);

export default Form;
