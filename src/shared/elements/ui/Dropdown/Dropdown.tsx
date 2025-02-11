import './Dropdown.scss';

import { cn } from '@bem-react/classname';
import { ComponentProps, memo, ReactNode, useRef, useState } from 'react';

import { Button } from '../Button/Button';
import { IconComponent } from '../IconComponent/IconComponent';
import { Popup } from '../Popup/Popup';

const cnDropdown = cn('Dropdown');

interface BaseDropdownOptions extends Record<string, string | number> {
  id: string | number;
}

type DropdownProps<T extends BaseDropdownOptions> = Omit<
  ComponentProps<typeof Popup>,
  | 'className'
  | 'withPortal'
  | 'onClose'
  | 'open'
  | 'anchorRef'
  | 'children'
  | 'placement'
> & {
  options: T[];
  className?: string;
  onClose?: () => void;
  labelField: keyof T;
  label?: ReactNode;
  onItemClick?: (item: T) => void;
  toggleComponent?: ReactNode;
  title?: string;
  uniqueIdentifier?: keyof T;
  value?: T;
};

const DropdownComponent = <T extends BaseDropdownOptions>(
  props: DropdownProps<T>,
): ReactNode => {
  const {
    className,
    onClose,
    onItemClick,
    toggleComponent,
    label,
    options,
    uniqueIdentifier = 'id',
    labelField = 'title',
    title = 'Выбрать',
    value = null,
    ...rest
  } = props;
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(value);

  const ref = useRef<HTMLDivElement>(null);

  const toggleOpen = (): void => {
    setOpen((prev) => !prev);
  };

  const handleClose = (): void => {
    if (onClose) {
      onClose();
    }

    setOpen(false);
  };

  const handleItemClick = (item: T): void => {
    setSelectedItem((prev) => {
      if (!prev) {
        return item;
      }
      return prev[uniqueIdentifier] === item[uniqueIdentifier] ? null : item;
    });

    onItemClick?.(item);

    handleClose();
  };

  return (
    <div ref={ref} className={cnDropdown(undefined, [props.className])}>
      <div className={cnDropdown('DropdownContent')}>
        <label className={cnDropdown('Label')}>{label}</label>
        <div className={cnDropdown('Toggle', { open: open })}>
          {toggleComponent ? (
            toggleComponent
          ) : (
            <Button
              className={cnDropdown('Button')}
              variant={'clear'}
              fullWidth
              size={'sm'}
              onClick={toggleOpen}
              addonRight={
                <IconComponent
                  className={cnDropdown('ArrowIcon', {
                    open: open,
                  })}
                  name={'ArrowSm'}
                  size={'md'}
                  color={'basic-primary'}
                />
              }
            >
              <span className={cnDropdown('Title')}>
                {selectedItem?.[labelField] ?? title}
              </span>
            </Button>
          )}
        </div>
        <Popup
          {...rest}
          className={cnDropdown('Popup')}
          open={open}
          onClose={handleClose}
          anchorRef={ref}
          closeOnOutsideClick
          closeOnEscape
        >
          <ul className={cnDropdown('List')}>
            {options.map((option) => (
              <li
                key={option.id}
                onClick={() => handleItemClick(option)}
                className={cnDropdown('ListItem', {
                  selected:
                    selectedItem?.[uniqueIdentifier] ===
                    option[uniqueIdentifier],
                })}
              >
                {option[labelField]}
              </li>
            ))}
          </ul>
        </Popup>
      </div>
    </div>
  );
};

export const Dropdown = memo(DropdownComponent) as <
  T extends BaseDropdownOptions,
>(
  props: DropdownProps<T>,
) => ReactNode;
