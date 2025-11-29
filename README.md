# Movie & TV Dashboard

This project is a React-based Movie & TV Dashboard that fetches data from the TMDB API. The app allows users to explore movies and TV shows, apply filters, search for specific items, and view summary statistics about the displayed data.

## Features

### 1. List of Data
- The site displays a list of movies or TV shows fetched using an API call to the TMDB API.
- The data is dynamically updated based on user interactions such as search and filters.
- The app uses the `useEffect` React hook and `async/await` syntax to fetch and manage data.

### 2. Summary Data Statistics
The app dashboard includes three summary statistics about the displayed data:
- **Total Items**: Displays the total number of movies or TV shows matching the current filters.
- **Year Range**: Shows the range of release years for the displayed movies (e.g., `1995 - 2023`).
- **Most Common Genre**: Displays the most frequently occurring genre among the displayed items.

### 3. Search Data
- A search bar allows users to search for movies or TV shows by title.
- The search dynamically updates the displayed results based on the query.

### 4. Filter Data
- Multiple filters allow users to refine the displayed data:
  - **Genre Filter**: Filter movies or TV shows by genre.
  - **Runtime Filter**: Filter movies by runtime (e.g., short, medium, or long).
  - **Content Type Filter**: Toggle between movies and TV shows.

### 5. Detail View
- Clicking on an item in the list view displays more details about it.
- Each item in the dashboard list navigates to a unique detail view page for that item.
- The detail view includes extra information about the item that is not displayed in the dashboard view.
- The same sidebar is displayed in the detail view as in the dashboard view.
- Each detail view has a direct, unique URL link to that item’s detail view page.

### 6. Charts
- The app includes at least two unique charts developed using the fetched data that tell an interesting story:
  - **Chart 1**: Displays the distribution of movies or TV shows by genre.
  - **Chart 2**: Shows the number of movies or TV shows released per year.
- Both charts are incorporated into the dashboard view of the site.
- Each chart describes a different aspect of the dataset, providing insights into the data.
![ezgif-8ef94c7a055292](https://github.com/user-attachments/assets/c5028330-7bf8-4ca7-b409-ede009c4c485)

