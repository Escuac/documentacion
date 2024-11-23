import React, { useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { useSearch } from '@hooks/useSearch';
import { searchUsers } from '@api/alumnosApi';

export const Test = () => {
  const { query, results, error, isLoading, onSearchChange, onReset, executeSearch }
    = useSearch('', { endpoint: searchUsers, limit: 10, page: 1, searchOnEmptyQuery: false })

  return (
    <div>
      <SearchBar
        onSearchChange={onSearchChange}
        onReset={onReset}
        placeholder='Buscar Alumno...'
      >
        <SearchBar.ResultContainer>
          {isLoading && <div>Cargando resultados...</div>}
          {error && <div>{error}</div>}
          {
          (!isLoading && !error && results?.users?.length > 0) && (
            results.users.map((result) => (
              <SearchBar.UserResultItem 
                key={result.id_usuario} 
                idUsuario={result.id_usuario}
                nombre={`${result.nombres} ${result.apellidos}`}
                run={result.run}
                onResultClick={(idUsuario) => console.log(idUsuario)}
              />
            ))
          )}
        </SearchBar.ResultContainer>
      </SearchBar>
      <p>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Culpa eius quibusdam voluptate nihil harum optio iste. Illo corrupti nulla nam quaerat molestiae ea, odit ducimus, rerum, a aperiam exercitationem commodi!
        Amet doloribus odit illum. Culpa blanditiis maiores excepturi dicta rem repudiandae necessitatibus porro, pariatur nam. Asperiores quam architecto nobis, hic minima atque repellendus blanditiis! Neque facere sapiente commodi quod porro!
        Velit pariatur minima dolorem ab nam! Magnam velit harum architecto facilis placeat voluptate ex adipisci dolorum, eaque quos illo voluptatum consequuntur expedita nobis. Hic, soluta sunt assumenda rem odio cupiditate.
        Autem accusamus corporis saepe magnam quisquam reprehenderit, amet fugit deleniti iusto itaque veritatis aperiam impedit rerum ut! Officiis maxime modi, iure rem distinctio debitis ad dolore impedit omnis id accusamus.
        Adipisci reprehenderit laborum, esse eos perspiciatis at magni. Deleniti incidunt qui modi ut facere perferendis, sit nisi, molestiae ad vero sunt nam quidem officiis obcaecati accusantium earum, cum aut magni!
        Ab, odit. Mollitia, culpa! Dolorum nisi, qui voluptatem officia nulla temporibus molestiae quos voluptatibus quam labore asperiores sit recusandae est doloremque accusantium. Accusantium quae reprehenderit tenetur. Odit voluptatibus ea voluptates!
        Minima sint vel iure et est mollitia dolor a deleniti odit laboriosam minus nostrum soluta sequi doloremque fugit, ad at tempore aspernatur, eligendi voluptatibus qui dolorum illum quaerat. Aliquid, nam.
        Minima aspernatur veniam omnis voluptates sunt aliquid, quod modi fuga sequi eum alias. Dicta nihil nulla, ea dolorem ab recusandae aperiam perspiciatis autem quos libero ipsa porro id laboriosam ex.
        Reprehenderit ad rerum mollitia repudiandae inventore cumque eius, quidem fugiat dolor voluptates, excepturi ipsum sint perspiciatis delectus adipisci distinctio nulla! Corporis labore minima aperiam quod fuga voluptates voluptas quibusdam? Error!
        Possimus illum nesciunt modi aperiam nihil dolore ad, facilis ipsam expedita similique aspernatur explicabo a eveniet et impedit ullam at! Eaque, sit. Facere culpa repellat exercitationem expedita veniam architecto voluptas?
        Repudiandae, veniam illo incidunt suscipit asperiores optio aperiam deserunt, numquam sint praesentium id vel quod cum reprehenderit natus? Voluptate blanditiis facere tempore amet error numquam ducimus nobis ea, officiis sequi.
        Quam reprehenderit aliquam, inventore facilis placeat, sint vero voluptate iure officiis animi architecto qui ad facere atque nulla repellat saepe perspiciatis sunt soluta vitae. Totam doloribus nam reiciendis fugiat ullam!
        Neque quo vero dolore, sint doloribus reprehenderit aut. Quo, qui! Ex non, vero ratione quaerat consequatur ab velit aut inventore iste sequi, provident eveniet, asperiores recusandae vitae illo? Ratione, blanditiis.
        Asperiores ducimus maiores adipisci dolore sequi at quasi eum iste fugit fuga provident ipsa facilis, unde repellat atque pariatur inventore similique doloribus, voluptatem autem nam. Quis eum officiis consectetur laudantium?
        Accusamus, voluptatibus a. Esse nulla reiciendis necessitatibus enim fuga assumenda dolores sapiente asperiores molestiae illum incidunt corrupti ut reprehenderit quae dicta, nihil a placeat! Non quisquam perspiciatis temporibus ducimus nihil?
        Laboriosam eum voluptate modi necessitatibus voluptas iusto molestiae doloremque fugit, nesciunt magnam distinctio voluptates eaque suscipit quisquam cupiditate voluptatibus dignissimos in corrupti natus labore repudiandae. Eveniet, laboriosam corrupti. Consequuntur, reprehenderit!
        Omnis cumque est voluptatibus debitis tempore iste dicta reiciendis. Facilis, vero natus perferendis quam labore dolorem nulla iusto aliquam neque laboriosam necessitatibus sed dolorum ut maiores expedita sequi non culpa?
        Adipisci officiis ratione nobis quis doloribus reprehenderit ipsum, sit autem veniam quas laborum quisquam accusantium facere possimus tempora amet! Odit molestiae fuga veniam autem a, omnis placeat voluptas. Quasi, rem?
        Atque nihil culpa molestias laboriosam quis in maxime quaerat sed id, sint ea libero, dicta architecto? Aut ut exercitationem recusandae delectus alias ipsum illo dignissimos praesentium, vel sequi sapiente maiores.
        Veniam eaque molestias voluptatibus quibusdam aperiam commodi fuga quidem, ipsam explicabo! Cupiditate veniam ducimus quia ipsam, veritatis sequi modi nulla debitis voluptatem voluptate autem sed, cum labore facilis, quos placeat.
      </p>
    </div>
  )
}