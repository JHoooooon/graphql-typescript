import React, { Fragment, useEffect, useState } from 'react';
import useCutQuery from '../../common/hooks/queries/useCutQuery';
import { Box, Image, SimpleGrid, Spinner } from '@chakra-ui/react';
import LazyLoader from '../common/LazyLoader';

interface FilmCutListProps {
  filmId: number;
}

const FilmCutList = ({ filmId }: FilmCutListProps) => {
  const [isImageLoading, setImageLoading] = useState(false);
  const { data, loading } = useCutQuery({ filmId });
  if (loading) {
    return (
      <Box textAlign={'center'}>
        <Spinner />
      </Box>
    );
  }
  const imageOnLoadHandler = () => {
    setImageLoading(true);
  };

  return (
    <SimpleGrid my={4} column={[1, 2, null, 3]} spacing={[2, null, 8]}>
      {data?.cuts.map((cut) => (
        <Fragment key={cut.id}>
          <LazyLoader height={469} isImageLoading={isImageLoading} isDataLoading={loading}>
            <Image
              rounded={20}
              src={cut.src}
              key={cut.id}
              loading="lazy"
              onLoad={imageOnLoadHandler}
            />
          </LazyLoader>
        </Fragment>
      ))}
    </SimpleGrid>
  );
};

export default FilmCutList;
