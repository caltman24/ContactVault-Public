interface BaseInputOptions {
  label?: string;
  placeholder: string;
  name: string;
  id: string;
  value?: string | number | readonly string[];
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
  className?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const BaseFormInput = ({
  label,
  id,
  name,
  value,
  placeholder,
  type,
  required,
  className,
  onChange,
}: BaseInputOptions) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div className="relative mt-1 rounded-md shadow-sm">
        <input
          type={type}
          name={name}
          value={value}
          id={id}
          onChange={onChange}
          className={`block w-full rounded-md border-gray-300 px-4 py-1  focus:border-brand focus:ring-brand sm:text-md dark:bg-zinc-800 ${
            className || ""
          }`}
          placeholder={placeholder}
          required={required}
        />
      </div>
    </div>
  );
};

export type InputSelectOptions = { value: string; label: string }[];

interface InputSelectProps {
  selectOptions: {
    name: string;
    id: string;
    label?: string;
    options: InputSelectOptions;
    value?: string | number | readonly string[];
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  };
  inputOptions: BaseInputOptions;
}

export const InputSelect = ({
  inputOptions,
  selectOptions,
}: InputSelectProps) => {
  return (
    <div className="w-full">
      {inputOptions.label && (
        <label
          htmlFor={inputOptions.name}
          className="block text-sm font-medium text-gray-700"
        >
          {inputOptions.label}
        </label>
      )}
      <div className="relative mt-1 rounded-md shadow-sm flex">
        <input
          type={inputOptions.type}
          name={inputOptions.name}
          id={inputOptions.id}
          value={inputOptions.value}
          onChange={inputOptions.onChange}
          required={inputOptions.required}
          className="block w-full rounded-tl-md rounded-bl-md border-gray-300 px-4 py-1  focus:border-brand focus:ring-brand sm:text-md dark:bg-zinc-800"
          placeholder={inputOptions.placeholder}
        />
        <div className="inset-y-0 right-0 flex items-center">
          <label htmlFor="currency" className="sr-only">
            {selectOptions.label}
          </label>
          <select
            id={selectOptions.id}
            name={selectOptions.label}
            value={selectOptions.value}
            onChange={selectOptions.onChange}
            className="h-full rounded-tr-md rounded-br-md border-transparent bg-transparent py-0 pl-2 pr-2 text-gray-500 focus:border-brand focus:ring-brand dark:bg-zinc-700 sm:text-sm dark:text-light-shade"
          >
            {selectOptions.options.map((o, index) => (
              <option
                value={o.value}
                key={index}
                className="dark:text-light-shade"
              >
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
