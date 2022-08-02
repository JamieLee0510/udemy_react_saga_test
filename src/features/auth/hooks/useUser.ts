import { useAppSelector } from "../../../app/store/hooks";
import { User } from "../../../utils/types";
import { SignInStatus } from "../types";

export function useUser(): { user: User; signInStatus: SignInStatus } {
  const fullUser = useAppSelector((state) => state.user);
  const user = fullUser?.userDetails;
  const signInStatus = fullUser?.signInStatus;
  return { user, signInStatus };
}
