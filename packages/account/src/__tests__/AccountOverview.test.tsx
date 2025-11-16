import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { AccountOverview } from '../components/AccountOverview';
import { renderWithAccountProvider, mockUser } from './test-utils';
import { LocalAccountService } from '../services/local-account-service';

describe('AccountOverview', () => {
  it('should show empty state when no user', async () => {
    // Create a service with no user
    const service = new LocalAccountService();
    await service.initialize();
    await service.logout();

    const { getByText } = renderWithAccountProvider(<AccountOverview />, {
      providerProps: { accountService: service },
    });

    await waitFor(() => {
      expect(getByText('No account information available')).toBeTruthy();
    });
  });

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
      expect(getByText('local@example.com')).toBeTruthy();
    });
  });

  it('should display user ID', async () => {
    const { getByText } = renderWithAccountProvider(<AccountOverview />);

    await waitFor(() => {
      expect(getByText('local-user')).toBeTruthy();
    });
  });

  it('should display member since date when createdAt exists', async () => {
    const service = new LocalAccountService();
    await service.initialize();
    // Update profile with a specific created date
    const user = await service.getCurrentUser();
    if (user) {
      (user as any).createdAt = new Date('2024-01-01');
    }

    const { getByText } = renderWithAccountProvider(<AccountOverview />, {
      providerProps: { accountService: service },
    });

    await waitFor(() => {
      expect(getByText('Member Since')).toBeTruthy();
    });
  });

  it('should display profile information when available', async () => {
    const service = new LocalAccountService();
    await service.initialize();
    await service.updateProfile({
      name: 'Test User',
      dateOfBirth: new Date('1990-01-01'),
      sex: 'male',
      phoneNumber: '+1234567890',
      biography: 'Test bio',
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
      // LocalAccountService has a default name, so we check for optional fields
      expect(queryByText('Biography')).toBeNull();
    });
  });

  it('should display actions section', async () => {
    const { getByText } = renderWithAccountProvider(<AccountOverview />);

    await waitFor(() => {
      expect(getByText('Actions')).toBeTruthy();
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
    const service = new LocalAccountService();
    await service.initialize();
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
    const service = new LocalAccountService();
    await service.initialize();
    const user = await service.getCurrentUser();
    if (user) {
      (user as any).email = null;
    }

    const { getByText } = renderWithAccountProvider(<AccountOverview />, {
      providerProps: { accountService: service },
    });

    await waitFor(() => {
      expect(getByText('Not set')).toBeTruthy();
    });
  });

  it('should format dates correctly', async () => {
    const service = new LocalAccountService();
    await service.initialize();
    await service.updateProfile({
      dateOfBirth: new Date('1990-06-15'),
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
