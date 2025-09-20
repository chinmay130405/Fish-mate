import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  title: string;
  showLanguageSwitcher?: boolean;
}

const Header = ({ title, showLanguageSwitcher = true }: HeaderProps) => {

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      {showLanguageSwitcher && <LanguageSwitcher />}
    </div>
  );
};

export default Header;