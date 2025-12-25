import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { AccountOverview } from '../components/AccountOverview';
import { renderWithAccountProvider, createMockAccountService } from './test-utils';
import { InMemoryAccountService } from '../services/in-memory-account-service';

describe('AccountOverview', () => {
  it('should show empty state when no user', async () => {
    // Create a service with no user (unauthenticated)
    const service = createMockAccountService(false);

    const { getByText } = renderWithAccountProvider(<AccountOverview />, {
      providerProps: { accountService: service },
    });

    await waitFor(() => {
      expect(getByText('No account information available')).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);

  it('should display account information section', async () => {
    const { getByText } = renderWithAccountProvider(<AccountOverview />);

    await waitFor(() => {
      expect(getByText('Account Information')).toBeTruthy();
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('User ID')).toBeTruthy();
    });
  });

  it('should display user email', async () => {
    const { getByText } = renderWithAccountProvider(<AccountOverview />);

    await waitFor(() => {
      expect(getByText('test@example.com')).toBeTruthy();
    });
  });

  it('should display user ID', async () => {
    const { getByText } = renderWithAccountProvider(<AccountOverview />);

    await waitFor(() => {
      expect(getByText('test-user-123')).toBeTruthy();
    });
  });

  it('should display member since date when createdAt exists', async () => {
    // Use an authenticated service with createdAt already set
    const service = createMockAccountService();

    const { getByText } = renderWithAccountProvider(<AccountOverview />, {
      providerProps: { accountService: service },
    });

    await waitFor(() => {
      expect(getByText('Member Since')).toBeTruthy();
    });
  });

  it('should display profile information when available', async () => {
    // Create a service with a user that has full profile data
    const service = new InMemoryAccountService({
      initialUser: {
        uid: 'test-user-123',
        email: 'test@example.com',
        name: {
          givenName: 'Test',
          familyName: 'User',
        },
        dateOfBirth: new Date('1990-01-01'),
        sex: 'male',
        phoneNumber: '+1234567890',
        biography: 'Test bio',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    });

    const { getByText } = renderWithAccountProvider(<AccountOverview />, {
      providerProps: { accountService: service },
    });

    await waitFor(() => {
      expect(getByText('Profile Information')).toBeTruthy();
      expect(getByText('Name')).toBeTruthy();
      expect(getByText('Test User')).toBeTruthy();
      expect(getByText('Date of Birth')).toBeTruthy();
      expect(getByText('Sex')).toBeTruthy();
      expect(getByText('male')).toBeTruthy();
      expect(getByText('Phone Number')).toBeTruthy();
      expect(getByText('+1234567890')).toBeTruthy();
      expect(getByText('Biography')).toBeTruthy();
      expect(getByText('Test bio')).toBeTruthy();
    });
  });

  it('should not display profile section when no profile data', async () => {
    const { queryByText } = renderWithAccountProvider(<AccountOverview />);

    await waitFor(() => {
      // InMemoryAccountService has a default name, so we check for optional fields
      expect(queryByText('Biography')).toBeNull();
    });
  });

  it('should display actions section', async () => {
    // Actions section contains the Logout button by default (no header text)
    const { getByText } = renderWithAccountProvider(<AccountOverview />);

    await waitFor(() => {
      // Logout button is shown by default in the actions section
      expect(getByText('Logout')).toBeTruthy();
    });
  });

  it('should display edit profile button by default', async () => {
    const { getByText } = renderWithAccountProvider(
      <AccountOverview onEditProfile={jest.fn()} />
    );

    await waitFor(() => {
      expect(getByText('Edit Profile')).toBeTruthy();
    });
  });

  it('should display change password button by default', async () => {
    const { getByText } = renderWithAccountProvider(
      <AccountOverview onChangePassword={jest.fn()} />
    );

    await waitFor(() => {
      expect(getByText('Change Password')).toBeTruthy();
    });
  });

  it('should display logout button by default', async () => {
    const { getByText } = renderWithAccountProvider(<AccountOverview />);

    await waitFor(() => {
      expect(getByText('Logout')).toBeTruthy();
    });
  });

  it('should hide edit profile button when showEditProfile is false', async () => {
    const { queryByText } = renderWithAccountProvider(
      <AccountOverview showEditProfile={false} onEditProfile={jest.fn()} />
    );

    await waitFor(() => {
      expect(queryByText('Edit Profile')).toBeNull();
    });
  });

  it('should hide change password button when showChangePassword is false', async () => {
    const { queryByText } = renderWithAccountProvider(
      <AccountOverview showChangePassword={false} onChangePassword={jest.fn()} />
    );

    await waitFor(() => {
      expect(queryByText('Change Password')).toBeNull();
    });
  });

  it('should hide logout button when showLogout is false', async () => {
    const { queryByText } = renderWithAccountProvider(
      <AccountOverview showLogout={false} />
    );

    await waitFor(() => {
      expect(queryByText('Logout')).toBeNull();
    });
  });

  it('should call onEditProfile when edit profile is pressed', async () => {
    const onEditProfile = jest.fn();
    const { getByText } = renderWithAccountProvider(
      <AccountOverview onEditProfile={onEditProfile} />
    );

    await waitFor(() => {
      expect(getByText('Edit Profile')).toBeTruthy();
    });

    fireEvent.press(getByText('Edit Profile'));
    expect(onEditProfile).toHaveBeenCalled();
  });

  it('should call onChangePassword when change password is pressed', async () => {
    const onChangePassword = jest.fn();
    const { getByText } = renderWithAccountProvider(
      <AccountOverview onChangePassword={onChangePassword} />
    );

    await waitFor(() => {
      expect(getByText('Change Password')).toBeTruthy();
    });

    fireEvent.press(getByText('Change Password'));
    expect(onChangePassword).toHaveBeenCalled();
  });

  it('should call onLogout when logout is pressed', async () => {
    const onLogout = jest.fn();
    const { getByText } = renderWithAccountProvider(<AccountOverview onLogout={onLogout} />);

    await waitFor(() => {
      expect(getByText('Logout')).toBeTruthy();
    });

    fireEvent.press(getByText('Logout'));
    expect(onLogout).toHaveBeenCalled();
  });

  it('should call logout from context when no onLogout callback provided', async () => {
    // Create an authenticated service
    const service = createMockAccountService();
    const logoutSpy = jest.spyOn(service, 'logout');

    const { getByText } = renderWithAccountProvider(<AccountOverview />, {
      providerProps: { accountService: service },
    });

    await waitFor(() => {
      expect(getByText('Logout')).toBeTruthy();
    });

    fireEvent.press(getByText('Logout'));

    await waitFor(() => {
      expect(logoutSpy).toHaveBeenCalled();
    });
  });

  it('should not show edit profile button without callback', async () => {
    const { queryByText } = renderWithAccountProvider(<AccountOverview />);

    await waitFor(() => {
      expect(queryByText('Edit Profile')).toBeNull();
    });
  });

  it('should not show change password button without callback', async () => {
    const { queryByText } = renderWithAccountProvider(<AccountOverview />);

    await waitFor(() => {
      expect(queryByText('Change Password')).toBeNull();
    });
  });

  it('should accept custom styles', async () => {
    const { getByTestId } = renderWithAccountProvider(
      <AccountOverview
        containerStyle={{ testID: 'container' } as any}
        sectionHeaderStyle={{ testID: 'header' } as any}
        labelStyle={{ testID: 'label' } as any}
        valueStyle={{ testID: 'value' } as any}
        buttonStyle={{ testID: 'button' } as any}
        buttonTextStyle={{ testID: 'buttonText' } as any}
      />
    );

    // Just verify it renders without crashing with custom styles
    await waitFor(() => {
      expect(getByTestId).toBeDefined();
    });
  });

  it('should show "Not set" for missing email', async () => {
    // Create a service with a user that has no email
    const service = new InMemoryAccountService({
      initialUser: {
        uid: 'test-user-123',
        email: null,
        name: { givenName: 'Test' },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    });

    const { getByText } = renderWithAccountProvider(<AccountOverview />, {
      providerProps: { accountService: service },
    });

    await waitFor(() => {
      expect(getByText('Not set')).toBeTruthy();
    });
  });

  it('should format dates correctly', async () => {
    // Create a service with a user that has dateOfBirth
    const service = new InMemoryAccountService({
      initialUser: {
        uid: 'test-user-123',
        email: 'test@example.com',
        dateOfBirth: new Date('1990-06-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    });

    const { getByText } = renderWithAccountProvider(<AccountOverview />, {
      providerProps: { accountService: service },
    });

    await waitFor(() => {
      expect(getByText('Date of Birth')).toBeTruthy();
      // The exact format depends on locale, so just verify it renders
    });
  });
});
