import { Helmet } from 'react-helmet-async';

const PageHead = ({ title, description }) => {
  return (
    <Helmet>
      {/* USE BACKTICKS HERE: `` */}
      <title>{`Essential Zone | ${title}`}</title>
      
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
};

export default PageHead;