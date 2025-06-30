import * as Yup from 'yup'

export const signUpSchema = Yup.object({
    email:Yup.string().email("Invalid Email").required("Email is required"),
    password:Yup.string().min(6,"Password should be atleast 6 characters").required('Password is required'),
    name:Yup.string().required("Name is required"),
    confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match").required("Confirm Password is required"),
})