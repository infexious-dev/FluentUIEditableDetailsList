/// <reference types="react" />
import { IDropdownProps } from "office-ui-fabric-react";
interface Props extends IDropdownProps {
    field?: string;
    minCharLengthBeforeSuggestion?: number;
}
declare const SearchableDropdown: (props: Props) => JSX.Element;
export default SearchableDropdown;
