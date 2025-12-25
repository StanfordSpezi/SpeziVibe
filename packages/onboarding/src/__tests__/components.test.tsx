import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaginationDots } from '../components/PaginationDots';
import { FeatureCard } from '../components/FeatureCard';
import { ConsentCheckbox } from '../components/ConsentCheckbox';
import { OnboardingButton } from '../components/OnboardingButton';
import { NameInputSection } from '../components/NameInputSection';

describe('PaginationDots', () => {
  it('should render without crashing', () => {
    const { toJSON } = render(<PaginationDots total={3} current={0} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render with isDark mode', () => {
    const { toJSON } = render(<PaginationDots total={3} current={1} isDark={true} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render with custom colors', () => {
    const customColors = {
      primaryLight: '#FF0000',
      primaryDark: '#00FF00',
      inactiveLight: '#0000FF',
      inactiveDark: '#FFFF00',
    };

    const { toJSON } = render(
      <PaginationDots total={2} current={0} isDark={false} colors={customColors} />
    );
    expect(toJSON()).toBeTruthy();
  });
});

describe('FeatureCard', () => {
  it('should render title and description', () => {
    const { getByText } = render(
      <FeatureCard
        icon="star"
        title="Test Feature"
        description="This is a test description"
      />
    );

    expect(getByText('Test Feature')).toBeTruthy();
    expect(getByText('This is a test description')).toBeTruthy();
  });

  it('should render custom icon via renderIcon', () => {
    const renderIcon = jest.fn((name, size, color) => null);

    render(
      <FeatureCard
        icon="star"
        title="Test"
        description="Test"
        renderIcon={renderIcon}
      />
    );

    expect(renderIcon).toHaveBeenCalledWith('star', 64, expect.any(String));
  });

  it('should render with isDark mode', () => {
    const { getByText } = render(
      <FeatureCard
        icon="star"
        title="Test Feature"
        description="Test"
        isDark={true}
      />
    );

    expect(getByText('Test Feature')).toBeTruthy();
  });

  it('should render icon placeholder when no renderIcon provided', () => {
    const { getByText } = render(
      <FeatureCard
        icon="star"
        title="Test Feature"
        description="Test"
      />
    );

    // Icon name is shown as placeholder
    expect(getByText('star')).toBeTruthy();
  });
});

describe('ConsentCheckbox', () => {
  it('should render label', () => {
    const { getByText } = render(
      <ConsentCheckbox
        checked={false}
        onToggle={jest.fn()}
        label="I agree to the terms"
      />
    );

    expect(getByText('I agree to the terms')).toBeTruthy();
  });

  it('should call onToggle when pressed', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <ConsentCheckbox
        checked={false}
        onToggle={onToggle}
        label="I agree"
      />
    );

    fireEvent.press(getByText('I agree'));

    expect(onToggle).toHaveBeenCalled();
  });

  it('should show checkmark when checked', () => {
    const { getByText } = render(
      <ConsentCheckbox
        checked={true}
        onToggle={jest.fn()}
        label="I agree"
      />
    );

    // Default checkmark is "✓"
    expect(getByText('✓')).toBeTruthy();
  });

  it('should not show checkmark when unchecked', () => {
    const { queryByText } = render(
      <ConsentCheckbox
        checked={false}
        onToggle={jest.fn()}
        label="I agree"
      />
    );

    expect(queryByText('✓')).toBeNull();
  });

  it('should render custom checkmark via renderCheckmark', () => {
    const renderCheckmark = jest.fn((color) => null);

    render(
      <ConsentCheckbox
        checked={true}
        onToggle={jest.fn()}
        label="I agree"
        renderCheckmark={renderCheckmark}
      />
    );

    expect(renderCheckmark).toHaveBeenCalledWith(expect.any(String));
  });

  it('should render with isDark mode', () => {
    const { getByText } = render(
      <ConsentCheckbox
        checked={true}
        onToggle={jest.fn()}
        label="I agree"
        isDark={true}
      />
    );

    expect(getByText('I agree')).toBeTruthy();
  });
});

describe('OnboardingButton', () => {
  it('should render label', () => {
    const { getByText } = render(
      <OnboardingButton label="Continue" onPress={jest.fn()} />
    );

    expect(getByText('Continue')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <OnboardingButton label="Continue" onPress={onPress} />
    );

    fireEvent.press(getByText('Continue'));

    expect(onPress).toHaveBeenCalled();
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <OnboardingButton label="Continue" onPress={onPress} disabled={true} />
    );

    fireEvent.press(getByText('Continue'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('should render with isDark mode', () => {
    const { getByText } = render(
      <OnboardingButton
        label="Continue"
        onPress={jest.fn()}
        isDark={true}
      />
    );

    expect(getByText('Continue')).toBeTruthy();
  });

  it('should render with custom colors', () => {
    const customColors = {
      primaryLight: '#FF0000',
      primaryDark: '#00FF00',
      inactiveLight: '#0000FF',
      inactiveDark: '#FFFF00',
    };

    const { getByText } = render(
      <OnboardingButton
        label="Continue"
        onPress={jest.fn()}
        isDark={false}
        colors={customColors}
      />
    );

    expect(getByText('Continue')).toBeTruthy();
  });
});

describe('NameInputSection', () => {
  it('should render given name and family name inputs', () => {
    const { getByPlaceholderText } = render(
      <NameInputSection
        givenName=""
        familyName=""
        onGivenNameChange={jest.fn()}
        onFamilyNameChange={jest.fn()}
      />
    );

    expect(getByPlaceholderText('Enter your first name')).toBeTruthy();
    expect(getByPlaceholderText('Enter your last name')).toBeTruthy();
  });

  it('should render custom labels', () => {
    const { getByText } = render(
      <NameInputSection
        givenName=""
        familyName=""
        onGivenNameChange={jest.fn()}
        onFamilyNameChange={jest.fn()}
        givenNameLabel="Vorname"
        familyNameLabel="Nachname"
      />
    );

    expect(getByText('Vorname')).toBeTruthy();
    expect(getByText('Nachname')).toBeTruthy();
  });

  it('should render custom placeholders', () => {
    const { getByPlaceholderText } = render(
      <NameInputSection
        givenName=""
        familyName=""
        onGivenNameChange={jest.fn()}
        onFamilyNameChange={jest.fn()}
        givenNamePlaceholder="Your first name"
        familyNamePlaceholder="Your last name"
      />
    );

    expect(getByPlaceholderText('Your first name')).toBeTruthy();
    expect(getByPlaceholderText('Your last name')).toBeTruthy();
  });

  it('should call onGivenNameChange when first name changes', () => {
    const onGivenNameChange = jest.fn();
    const { getByPlaceholderText } = render(
      <NameInputSection
        givenName=""
        familyName=""
        onGivenNameChange={onGivenNameChange}
        onFamilyNameChange={jest.fn()}
      />
    );

    fireEvent.changeText(getByPlaceholderText('Enter your first name'), 'John');

    expect(onGivenNameChange).toHaveBeenCalledWith('John');
  });

  it('should call onFamilyNameChange when last name changes', () => {
    const onFamilyNameChange = jest.fn();
    const { getByPlaceholderText } = render(
      <NameInputSection
        givenName=""
        familyName=""
        onGivenNameChange={jest.fn()}
        onFamilyNameChange={onFamilyNameChange}
      />
    );

    fireEvent.changeText(getByPlaceholderText('Enter your last name'), 'Doe');

    expect(onFamilyNameChange).toHaveBeenCalledWith('Doe');
  });

  it('should display current values', () => {
    const { getByDisplayValue } = render(
      <NameInputSection
        givenName="John"
        familyName="Doe"
        onGivenNameChange={jest.fn()}
        onFamilyNameChange={jest.fn()}
      />
    );

    expect(getByDisplayValue('John')).toBeTruthy();
    expect(getByDisplayValue('Doe')).toBeTruthy();
  });

  it('should render with isDark mode', () => {
    const { getByPlaceholderText } = render(
      <NameInputSection
        givenName=""
        familyName=""
        onGivenNameChange={jest.fn()}
        onFamilyNameChange={jest.fn()}
        isDark={true}
      />
    );

    expect(getByPlaceholderText('Enter your first name')).toBeTruthy();
  });
});
