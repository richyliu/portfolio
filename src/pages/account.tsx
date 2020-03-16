import React, { ReactElement, ReactNode } from "react";
import firebase from "gatsby-plugin-firebase";
import { Alert, Button, Form, Table } from "react-bootstrap";
import { Layout, SEO } from "../components/layout";
import NewPassword from "../components/auth/NewPassword";
import { navigate } from "gatsby";
import {
  AuthContinueState,
  AuthReturnState,
  useAuthState,
} from "../components/auth";
import { Field, Formik, FormikBag } from "formik";
import * as Yup from "yup";
import Mailcheck from "mailcheck";
import { User } from "firebase";
// const UpdateDisplayNameForm = (): ReactElement => {
// 	const [user, loading, error] = useAuthState(firebase.auth())
// 	const [name, setName] = React.useState(user?.displayName || "Loading...")
// 	if (!user) return <></>
//
// 	const handleSubmit = (): void => {
// 		user
// 			.updateProfile({
// 				displayName: name,
// 				// photoURL: "https://example.com/jane-q-user/profile.jpg"
// 			})
// 			.then(function () {
// 				console.log("DONE")
// 			})
// 			.catch(function (error) {
// 				console.log(error)
// 			})
// 	}
// }

interface AccountDetailsProps {
  editable: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSuccess: () => void;
  /**
   * The user data to display.
   */
  user: User;
}

interface AccountDetailFieldProps {
  name?: string;
  children?: ReactNode;
  renderIf?: boolean;
  /**
   * Used for rendering just a divider.
   */
  empty?: boolean;
}

const AccountDetailField = ({
  name,
  children,
  renderIf,
  empty,
}: AccountDetailFieldProps): ReactElement => {
  if (renderIf === false) return <></>;
  // if renderIf is undefined, don't return nothing
  if (empty) {
    return (
      <tr>
        <td colSpan={2} />
      </tr>
    );
  }
  return (
    <tr>
      <td
        className="w-33"
        style={{
          height: "5.75em",
          verticalAlign: "middle",
          padding: 0,
        }}
      >
        {name}
      </td>
      <td
        className="w-66"
        style={{
          height: "5.75em",
          verticalAlign: "middle",
          paddingBottom: 0,
        }}
      >
        {children}
      </td>
    </tr>
  );
};

const AccountDetails = ({
  user,
  editable,
  onEdit,
  onCancel,
  onSuccess,
}: AccountDetailsProps): ReactElement => {
  interface FormData {
    newEmail: string;
    newPassword: string;
    confirmNewPassword: string;
  }

  const handleSubmit = (
    { newPassword, confirmNewPassword, newEmail }: FormData,
    { setSubmitting, setErrors }: FormikBag<FormData, FormData>
  ): void => {
    console.log(newPassword, confirmNewPassword, newEmail);
    const requiresChallenge = false;
    const pendingUpdates = [];
    if (newPassword) {
      if (newPassword !== confirmNewPassword) {
        setErrors({
          confirmNewPassword: "The password you entered doesn't match.",
        });
        setSubmitting(false);
        return;
      }

      pendingUpdates.push(
        user
          .updatePassword("") //newPassword) // TODO REMOVE
          .catch(error => Promise.reject(error)) // pass the error through
      );
    }
    Promise.all(pendingUpdates)
      .then(function() {
        // Updates successful.
        console.log("DONE");
        setSubmitting(false);
        onSuccess();
      })
      .catch(function(error) {
        // An error happened.
        // alert("ERROR")
        console.log(error);
        // switch (error.code) {
        // 	case "auth/requires-recent-login":
        navigate("/account/login", {
          state: {
            from: "/account",
            isChallenge: true,
            return: true,
            state: {
              updateInProgress: true,
              editable: false,
              newPassword: newPassword !== "" ? newPassword : undefined,
              newEmail:
                newEmail !== "" && newEmail !== user.email
                  ? newEmail
                  : undefined,
            },
          } as AuthContinueState,
        });
        // break
        // 	default:
        // 		setErrors({
        // 			confirmNewPassword: unexpectedFirebaseError(error)
        // 		})
        // }
        setSubmitting(false);
      });
  };
  const schema = Yup.object().shape({
    newEmail: Yup.string().email("The email you entered isn't valid."),
    newPassword: Yup.string().min(
      6,
      "Your password isn't at least six characters."
    ),
    confirmNewPassword: Yup.string().oneOf(
      [Yup.ref("newPassword")],
      "The password you entered doesn't match."
    ),
  });

  return (
    <Formik
      validationSchema={schema}
      initialValues={{
        newEmail: user.email || "",
        newPassword: "",
        confirmNewPassword: "",
      }}
      onSubmit={handleSubmit}
    >
      {({
        errors,
        touched,
        handleSubmit,
        values,
        isSubmitting,
        setFieldValue,
        isValid,
      }: {
        errors: { [Field: string]: string };
        touched: { [Field: string]: boolean };
        handleSubmit: (e: React.FormEvent) => void;
        values: FormData;
        isSubmitting: boolean;
        setFieldValue: (
          field: string,
          value: any,
          shouldValidate?: boolean
        ) => void;
        isValid: boolean;
      }): ReactElement => {
        const changes = {
          newEmail: values.newEmail !== user.email && values.newEmail !== "",
          newPassword: values.newPassword !== "",
          any: false,
        };
        changes.any = changes.newEmail || changes.newPassword;

        const emailSuggestion = React.useMemo(
          () =>
            Mailcheck.run({
              secondLevelDomains: [
                "yahoo",
                "hotmail",
                "mail",
                "live",
                "outlook",
                "icloud",
              ],
              email: values.newEmail,
            })?.full,
          [values.newEmail]
        );

        return (
          <Form onSubmit={handleSubmit} className="py-3">
            <a
              onClick={(): void => {
                if (!editable) {
                  onEdit();
                } else {
                  onCancel();
                }
              }}
              className={isSubmitting ? "text-muted" : ""}
            >
              {editable ? "Cancel" : "Edit"}
            </a>
            <Table responsive>
              <tbody>
                <AccountDetailField name={"Full Name"}>
                  {user.displayName || "Not Set"}
                  {editable && (
                    <Form.Text className="text-muted">
                      To change your account name, please contact the webmaster.
                    </Form.Text>
                  )}
                </AccountDetailField>
                <AccountDetailField name={"Email"}>
                  {editable ? (
                    <Form.Group>
                      <Field
                        as={Form.Control}
                        name={"newEmail"}
                        isInvalid={errors.newEmail && touched.newEmail}
                        placeholder={"Enter a new email"}
                        disabled={isSubmitting}
                      />
                      <Form.Text>
                        {emailSuggestion && (
                          <>
                            Did you mean:{" "}
                            <a
                              onClick={(): void =>
                                setFieldValue("newEmail", emailSuggestion)
                              }
                            >
                              {emailSuggestion}
                            </a>
                            ?
                          </>
                        )}
                      </Form.Text>
                      <Form.Control.Feedback type={"invalid"}>
                        {errors.newEmail}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        If you do not want to change your email, either leave
                        this field blank or set it to your current email.
                      </Form.Text>
                    </Form.Group>
                  ) : (
                    <>{user.email || "Not Set"}</>
                  )}
                </AccountDetailField>
                <AccountDetailField name={"New Password"} renderIf={editable}>
                  <Form.Group>
                    <Field
                      as={NewPassword}
                      name={"newPassword"}
                      isInvalid={errors.newPassword && touched.newPassword}
                      error={errors.newPassword}
                      placeholder={"Enter a new password"}
                      disabled={isSubmitting}
                    />
                    <Form.Text className="text-muted">
                      If you do not want to change your password, leave this
                      field blank.
                    </Form.Text>
                  </Form.Group>
                </AccountDetailField>
                <AccountDetailField name={"Password"} renderIf={!editable}>
                  <a onClick={(): void => onEdit()}>Enter editing mode</a> to
                  change your password
                </AccountDetailField>
                <AccountDetailField
                  name={"Confirm New Password"}
                  renderIf={editable && !!values.newPassword}
                >
                  <Form.Group>
                    <Field
                      as={Form.Control}
                      name={"confirmNewPassword"}
                      placeholder={"Confirm your new password"}
                      type="password"
                      disabled={isSubmitting}
                      isInvalid={
                        errors.confirmNewPassword && touched.confirmNewPassword
                      }
                    />

                    <Form.Control.Feedback type="invalid">
                      {errors.confirmNewPassword}
                    </Form.Control.Feedback>
                  </Form.Group>
                </AccountDetailField>

                <AccountDetailField empty />
              </tbody>
            </Table>
            {editable && (
              <>
                {changes.any && (
                  <div>
                    <h3>Summary of your unsaved changes</h3>
                    <ul>
                      {changes.newPassword && (
                        <li>
                          Password changed (
                          <a
                            onClick={(): void => {
                              setFieldValue("newPassword", "");
                              setFieldValue("confirmNewPassword", "");
                            }}
                          >
                            Undo
                          </a>
                          )
                        </li>
                      )}
                      {changes.newEmail && (
                        <li>
                          Email changed from {user.email} to{" "}
                          <b>{values.newEmail}</b> (
                          <a
                            onClick={(): void =>
                              setFieldValue("newEmail", user.email)
                            }
                          >
                            Undo
                          </a>
                          )
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                <Button
                  variant="outline-danger"
                  className=""
                  onClick={(): void => onCancel()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type={"submit"}
                  className="float-right"
                  disabled={!changes.any || !isValid || isSubmitting}
                >
                  {!changes.any
                    ? "No changes to save"
                    : !isValid
                    ? "Fix errors before saving"
                    : "Save"}
                </Button>
              </>
            )}
          </Form>
        );
      }}
    </Formik>
  );
};
const AccountPage = ({
  location,
}: {
  location?: AuthReturnState;
}): ReactElement => {
  const [user, loading, error] = useAuthState(firebase);
  const [editable, setEditable] = React.useState(
    location?.state?.state?.editable || false
  );
  const [showSuccess, setShowSuccess] = React.useState(false);

  if (!loading && !user) {
    navigate("/account/login", {
      state: {
        from: "/account",
        message: true,
        return: true,
      } as AuthContinueState,
    });
  }

  React.useEffect(() => {
    // The state needs to be updated on reload, otherwise some functions may be performed twice.
    window.onbeforeunload = (): void => {
      history.replaceState({}, "");
    };
  }, []);

  // React.useEffect(() => {
  // 	if (!user)return;
  // 	user.updateProfile({
  // 		displayName: "Jeffrey Meng",
  // 	}).then(function() {
  // 		// Update successful.
  // 	}).catch(function(error) {
  // 		alert("ERROR");
  // 		console.log(error);
  // 	})
  // }, [user])
  console.log("LL", location.state);

  React.useEffect(() => {
    if (!user) return;

    if (location?.state?.state?.updateInProgress) {
      if (location?.state?.state?.newPassword) {
        user
          .updatePassword(location?.state?.state?.newPassword)
          .then(function() {
            // Update successful.
            console.log("DONE");
            setShowSuccess(true);

            // onSuccess()
          })
          .catch(function(error: firebase.auth.Error) {
            // An error happened.
            // alert("ERROR")
            console.log(error);
            // switch (error.code) {
            // 	case "auth/requires-recent-login":
            // requiresChallenge = true
            // break
            // 	default:
            // 		setErrors({
            // 			confirmNewPassword: unexpectedFirebaseError(error)
            // 		})
            // }
            // setSubmitting(false)
          });
      }
    }
  }, [user]);

  return (
    <Layout>
      <SEO title="Your Account" />
      <h1>Account Settings</h1>
      <p>
        Hello, <b>{user?.displayName}</b>. These are your settings.
      </p>
      <Alert
        variant={"success"}
        dismissible
        show={showSuccess}
        onClose={(): void => setShowSuccess(false)}
      >
        Your setttings has been successfully updated.
      </Alert>
      {/*<button onClick={(): void => {*/}
      {/*	*/}
      {/*}}*/}
      {/*>click to reauthenticate*/}
      {/*</button>*/}

      {user && (
        <AccountDetails
          editable={editable}
          onCancel={(): void => setEditable(false)}
          onEdit={(): void => {
            navigate("/account/login", {
              state: {
                from: "/account",
                isChallenge: true,
                return: true,
                state: {
                  editable: true,
                },
              } as AuthContinueState,
            });
          }}
          onSuccess={(): void => {
            setShowSuccess(true);
            setEditable(false);
          }}
          // onEdit={}
          user={user}
        />
      )}
    </Layout>
  );
};

export default AccountPage;
